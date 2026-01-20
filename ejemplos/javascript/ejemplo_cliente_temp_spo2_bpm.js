// Ejemplo de cliente MQTT que envía datos simulados 
// de temperatura, saturación de oxígeno y pulsaciones
// por minuto cada 5 segundos.

// Ejecutar en la terminal con el comando: 
//      node ejemplos/javascript/ejemplo_cliente_temp_spo2_bpm.js

const mqtt = require('mqtt');

// Conexión al broker público
const client = mqtt.connect('mqtt://broker.hivemq.com');

const topic = 'pf_rense/temp_spo2_bpm';

client.on('connect', () => {
    console.log('Conectado al broker - Enviando datos...');
    
    // Simulamos un sensor que envía datos cada 5 segundos
    setInterval(() => {
        const temp = (Math.random() * (30 - 20) + 20).toFixed(2); // Genera temp entre 20 y 30
        const spo2 = (Math.random() * (100 - 90) + 90).toFixed(2); // Genera SpO2 entre 90 y 100
        const bpm = Math.floor(Math.random() * (120 - 60) + 60); // Genera BPM entre 60 y 120
        const mensaje = JSON.stringify({ 
            final_temp: temp, 
            final_spo2: spo2,
            final_bpm: bpm,
        });

        client.publish(topic, mensaje, () => {
            console.log(`Enviado a ${topic}: ${mensaje}`);
        });
    }, 5000);
});