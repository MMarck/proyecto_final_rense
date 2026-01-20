const express = require('express');
const mqtt = require('mqtt');
const app = express();
const { Client, Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');


app.use(cors({ origin: '*' }));



// Definición de tópicos MQTT
const topic_bmp_spo2_temp = 'pf_rense/temp_spo2_bpm';
const topic_sig_vit_ecg = 'pf_rense/signos_vitales_ecg';

// Configuración de conexión (primero ajustar archivo .env, usar ejemplo)
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
};


// 1. Conexión al Broker MQTT y suscripción a tópicos
const client = mqtt.connect('mqtt://broker.hivemq.com'); // Broker público para pruebas

client.on('connect', () => {
    console.log('Conectado al Broker MQTT');
    client.subscribe([topic_bmp_spo2_temp, topic_sig_vit_ecg]);
});



// Variable local para guardar el último dato recibido
let ultimaTemperatura = "Esperando datos...";
let ultimaSaturacionOxigeno = "Esperando datos...";
let ultimaPulsacionPorMinuto = "Esperando datos...";
let ultimosSignosVitalesECG = {valores: [], tiempos: []};

const pool = new Pool({ ...dbConfig, database: 'proyecto_rense_db' });

// 2. Escuchar mensajes MQTT

// manejador para el tópico combinado de 
// pulsaciones por minuto (BMP), saturacion 
// de oxigeno (SpO2) y temperatura
client.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    try {
        if (topic === topic_bmp_spo2_temp) {
            
            // Guardar temperatura
            if (data.final_temp !== undefined) {
                await pool.query(
                    'INSERT INTO temperatura (valor) VALUES ($1)',
                    [data.final_temp]
                );
                console.log(`Temp => ${data.final_temp}`);
            }
            
            // Guardar SpO2
            if (data.final_spo2 !== undefined) {
                await pool.query(
                    'INSERT INTO saturacion_oxigeno (valor) VALUES ($1)',
                    [data.final_spo2]
                );
                console.log(`SpO2 => ${data.final_spo2}`);
            }

            // Guardar pulsaciones (BPM)
            if (data.final_bpm !== undefined) {
                await pool.query(
                    'INSERT INTO pulsaciones_por_minuto (valor) VALUES ($1)',
                    [data.final_bpm]
                );
                console.log(`BPM => ${data.final_bpm}`);
            }



            // Guardar última lectura en RAM
            ultimaTemperatura = data.final_temp
            ultimaSaturacionOxigeno = data.final_spo2
            ultimaPulsacionPorMinuto = data.final_bpm

            console.log(`Nuevo dato en ${topic}: BPM=${data.final_bpm}, SpO2=${data.final_spo2}, Temp=${data.final_temp}`);
        }
    } catch (err) {
        console.error("Error guardando en DB:", err);
    }
});

client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        if (topic === topic_sig_vit_ecg) {
            
            // Validación mínima
            if (!Array.isArray(data.valor) || !Array.isArray(data.tiempo)) {
                console.error("Formato inválido, se esperaban arrays");
                return;
            }

            if (data.valor.length !== data.tiempo.length) {
                console.error("La cantidad de valores no coincide con la de tiempos");
                return;
            }

            // Construimos valores para INSERT
            const rows = data.valor.map((v, i) => `(${v}, ${data.tiempo[i]})`).join(',');

            const query = `
                INSERT INTO signos_vitales_ecg (valor, tiempo)
                VALUES ${rows}
            `;

            await pool.query(query);
            
            // Guardar última lectura en RAM
            ultimosSignosVitalesECG.valores = data.valor;
            ultimosSignosVitalesECG.tiempos = data.tiempo;

            console.log(`Insertados ${data.valor.length} signos vitales`);
        }

    } catch (err) {
        console.error("Error guardando signos vitales:", err);
        console.log("Mensaje recibido:", message.toString());
    }
});



// 3. Endpoint de Express para tu SPA

// --- Rutas para obtener el último dato ---
app.get('/api/ultimos_valores', (req, res) => {
    res.json({
        temperatura: ultimaTemperatura,
        saturacion_oxigeno: ultimaSaturacionOxigeno,
        pulsaciones_por_minuto: ultimaPulsacionPorMinuto,
        signos_vitales_ecg: ultimosSignosVitalesECG   
    });
});


// --- Rutas para obtener el historial completo ---
// ejemplo: /api/historial_completo/temperatura?limite=20
app.get('/api/historial_completo/temperatura', async (req, res) => {
    const limite = req.query.limite; // Si no se envía, req.params.limite será 'undefined'
    try {
        let query;
        let valores = [];

        // 2. Si el usuario no mandó límite o mandó -1, no aplicamos LIMIT
        if (!limite || limite <= 0) {
            query = 'SELECT * FROM temperatura ORDER BY timestamp DESC';
        } else {
            query = 'SELECT * FROM temperatura ORDER BY timestamp DESC LIMIT $1';
            valores.push(parseInt(limite));
        }

        const resultado = await pool.query(query, valores);
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error al obtener temperatura:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});
app.get('/api/historial_completo/saturacion_oxigeno', async (req, res) => {
    const limite = req.query.limite; // Si no se envía, req.params.limite será 'undefined'
    try {
        let query;
        let valores = [];

        // 2. Si el usuario no mandó límite o mandó -1, no aplicamos LIMIT
        if (!limite || limite <= 0) {
            query = 'SELECT * FROM saturacion_oxigeno ORDER BY timestamp DESC';
        } else {
            query = 'SELECT * FROM saturacion_oxigeno ORDER BY timestamp DESC LIMIT $1';
            valores.push(parseInt(limite));
        }

        const resultado = await pool.query(query, valores);
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error al obtener saturación de oxígeno:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});
app.get('/api/historial_completo/signos_vitales_ecg', async (req, res) => {
    const limite = req.query.limite; // Si no se envía, req.params.limite será 'undefined'
    try {
        let query;
        let valores = [];

        // 2. Si el usuario no mandó límite o mandó -1, no aplicamos LIMIT
        if (!limite || limite <= 0) {
            query = 'SELECT * FROM signos_vitales_ecg ORDER BY timestamp DESC';
        } else {
            query = 'SELECT * FROM signos_vitales_ecg ORDER BY timestamp DESC LIMIT $1';
            valores.push(parseInt(limite));
        }

        const resultado = await pool.query(query, valores);
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error al obtener signos vitales:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});


// Ejemplos: 
//  http://localhost:3000/api/entre_momentos/temperatura
//  http://localhost:3000/api/entre_momentos/temperatura?inicio=2024-01-01T00:00:00Z
//  http://localhost:3000/api/entre_momentos/temperatura?fin=2024-01-01T00:00:00Z
//  http://localhost:3000/api/entre_momentos/temperatura?inicio=2024-01-01T00:00:00Z&fin=2024-01-31T23:59:59Z

app.get('/api/entre_momentos/:tipo', async (req, res) => {
    const { tipo } = req.params;
    const { inicio, fin } = req.query;

    // 1. Mapeo de seguridad y nombres de tabla reales
    const tablasPermitidas = {
        'temperatura': 'temperatura',
        'saturacion_oxigeno': 'saturacion_oxigeno',
        'signos_vitales_ecg': 'sig_vit' // Asegúrate que este sea el nombre real en Postgres
    };

    const tablaReal = tablasPermitidas[tipo];

    if (!tablaReal) {
        return res.status(400).json({ error: "Tipo de dato no válido" });
    }

    let query = `SELECT * FROM ${tablaReal}`;
    let valores = [];
    let condiciones = [];

    // 2. Construcción dinámica de la consulta
    if (inicio) {
        valores.push(inicio);
        condiciones.push(`timestamp >= $${valores.length}`);
    }

    if (fin) {
        valores.push(fin);
        condiciones.push(`timestamp <= $${valores.length}`);
    }

    // Si hay condiciones, las añadimos al WHERE
    if (condiciones.length > 0) {
        query += ` WHERE ${condiciones.join(' AND ')}`;
    }

    query += ` ORDER BY timestamp DESC`;

    try {
        const resultado = await pool.query(query, valores);
        res.json({
            total: resultado.rowCount,
            datos: resultado.rows
        });
    } catch (err) {
        console.error("Error SQL:", err.message);
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
});