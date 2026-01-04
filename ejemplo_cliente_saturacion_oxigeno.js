// Ejemplo de cliente MQTT que envía datos simulados de temperatura cada 5 segundos.
// Ejecutar en la terminal con el comando: 
//      node ejemplo_cliente_saturacion_oxigeno.js

const mqtt = require('mqtt');

// Conexión al broker público
const client = mqtt.connect('mqtt://broker.hivemq.com');

const topic = 'pf_rense/saturacion_oxigeno002';

client.on('connect', () => {
    console.log('Conectado al broker - Enviando datos...');
    
    // Simulamos un sensor que envía datos cada 5 segundos
    setInterval(() => {
        const spo2 = (Math.random() * (100 - 90) + 90).toFixed(2); // Genera SpO2 entre 90 y 100
        const mensaje = JSON.stringify({ 
            valor: spo2, 
            unidad: 'SpO2',
            timestamp: new Date().toISOString() 
        });

        client.publish(topic, mensaje, () => {
            console.log(`Enviado a ${topic}: ${mensaje}`);
        });
    }, 5000);
});