// Ejecutar en la terminal con:
//      node ejemplos/javascript/ejemplo_cliente_signos_vitales_ecg.js

const mqtt = require('mqtt');

// Conexión al broker público
const client = mqtt.connect('mqtt://broker.hivemq.com');

// Tópico MQTT
const topic = 'pf_rense/signos_vitales_ecg';

client.on('connect', () => {
    console.log('Conectado al broker - Enviando datos...');
    
    // Buffers separados
    const bufferValor = [];
    const bufferTiempo = [];

    const TAMANIO_ENVIO = 200; // Enviar cuando lleguemos a 200 datos

    setInterval(() => {

        // Simular dato
        const valor = Math.floor(Math.random() * (90 - 60) + 60); // BPM random aprox
        const tiempo = Date.now(); // long long int (ms desde 1970)

        bufferValor.push(valor);
        bufferTiempo.push(tiempo);

        // Cuando llegaron a 200 → enviar paquete
        if (bufferValor.length >= TAMANIO_ENVIO) {

            const paquete = {
                valor: bufferValor,
                tiempo: bufferTiempo
            };

            client.publish(topic, JSON.stringify(paquete));
            console.log(`¡Lote de ${TAMANIO_ENVIO} datos enviado!`);

            // Limpiar buffers
            bufferValor.length = 0;
            bufferTiempo.length = 0;
        }

    }, 50); // 50ms → genera 200 datos en ~10 segundos
});
