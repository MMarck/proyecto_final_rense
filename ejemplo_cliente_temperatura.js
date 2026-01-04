// Ejemplo de cliente MQTT que envía datos simulados de temperatura cada 5 segundos.
// Ejecutar en la terminal con el comando: 
//      node ejemplo_cliente_temperatura.js

const mqtt = require('mqtt');

// Conexión al broker público
const client = mqtt.connect('mqtt://broker.hivemq.com');

const topic = 'pf_rense/temperatura001';

client.on('connect', () => {
    console.log('Conectado al broker - Enviando datos...');
    
    // Simulamos un sensor que envía datos cada 5 segundos
    setInterval(() => {
        const temp = (Math.random() * (30 - 20) + 20).toFixed(2); // Genera temp entre 20 y 30
        const mensaje = JSON.stringify({ 
            valor: temp, 
            unidad: 'Celsius',
            timestamp: new Date().toISOString() 
        });

        client.publish(topic, mensaje, () => {
            console.log(`Enviado a ${topic}: ${mensaje}`);
        });
    }, 5000);
});