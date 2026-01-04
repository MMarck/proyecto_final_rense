// Ejemplo de cliente MQTT que envía datos simulados de temperatura cada 5 segundos.
// Ejecutar en la terminal con el comando: 
//      node ejemplo_cliente_signos_vitales.js

const mqtt = require('mqtt');

// Conexión al broker público
const client = mqtt.connect('mqtt://broker.hivemq.com');

//  El protocolo MQTT no esta diseñado para enviar archivos grandes, asi que para este ejemplo se usará un arreglo para enviar las señales de signos vitales.
const topic = 'pf_rense/signos_vitales003';

client.on('connect', () => {
    console.log('Conectado al broker - Enviando datos...');
    
    let bufferSignos = [];
    const FRECUENCIA_ENVIO = 60; // Enviar cuando lleguemos a 60 datos

    setInterval(() => {
        // Simulamos la captura de un dato
        const nuevoDato = {
            pulso: Math.floor(Math.random() * (90 - 60) + 60),
            ts: new Date().toISOString()
        };
        
        bufferSignos.push(nuevoDato);

        // Cuando el buffer está lleno, publicamos y limpiamos
        if (bufferSignos.length >= FRECUENCIA_ENVIO) {
            client.publish(topic, JSON.stringify(bufferSignos));
            console.log("¡Lote de 60 datos enviado!");
            bufferSignos = []; // Limpiar buffer
        }
    }, 500); // Captura un dato cada 500ms (30 segundos para completar los 60)
});
