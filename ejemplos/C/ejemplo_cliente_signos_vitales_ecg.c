// Este es un ejemplo de un cliente MQTT en C que simula
// la recolección y envío de datos de signos vitales (ECG) 

// compilar con:
// gcc ejemplos/C/ejemplo_cliente_signos_vitales_ecg.c -lpaho-mqtt3c -lrt -o ejemplo_cliente_signos_vitales_ecg

// ejecutar con:
// ./ejemplo_cliente_signos_vitales_ecg

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include "MQTTClient.h"

#define ADDRESS     "tcp://broker.hivemq.com:1883"
#define CLIENTID    "cliente_c_signos_vitales_ecg"
#define TOPIC       "pf_rense/signos_vitales_ecg"
#define QOS         1
#define TIMEOUT     10000L


#define TAMANIO_ENVIO 200

// Random int generator
int rand_int(int min, int max) {
    return min + rand() % (max - min + 1);
}

// Epoch ms
long long epoch_ms() {
    struct timespec ts;
    // error: identifier "CLOCK_REALTIME" is undefined. Esta relacionado con el IDE, se resuelve al compilar 
    clock_gettime(CLOCK_REALTIME, &ts);
    return (long long)ts.tv_sec * 1000LL + ts.tv_nsec / 1000000LL;
}

int main() {
    MQTTClient client;
    MQTTClient_connectOptions conn_opts = MQTTClient_connectOptions_initializer;
    int rc;

    srand(time(NULL));

    MQTTClient_create(&client, ADDRESS, CLIENTID,
        MQTTCLIENT_PERSISTENCE_NONE, NULL);

    conn_opts.keepAliveInterval = 20;
    conn_opts.cleansession = 1;

    if ((rc = MQTTClient_connect(client, &conn_opts)) != MQTTCLIENT_SUCCESS) {
        printf("Error conectando al broker, código %d\n", rc);
        return rc;
    }

    printf("Conectado al broker - Enviando datos...\n");

    int idx = 0;
    int valores[TAMANIO_ENVIO];
    long long tiempos[TAMANIO_ENVIO];

    while (1) {
        
        // Simular ECG o BPM
        valores[idx] = rand_int(60, 90);
        tiempos[idx] = epoch_ms();

        idx++;

        // Cuando se llenan los 200 valores => enviar
        if (idx >= TAMANIO_ENVIO) {
            char payload[8192];
            int offset = 0;

            offset += snprintf(payload + offset, sizeof(payload) - offset, "{\"valor\":[");
            for (int i = 0; i < TAMANIO_ENVIO; i++) {
                offset += snprintf(payload + offset, sizeof(payload) - offset,
                    "%d%s", valores[i], (i < TAMANIO_ENVIO - 1) ? "," : "");
            }

            offset += snprintf(payload + offset, sizeof(payload) - offset, "],\"tiempo\":[");
            for (int i = 0; i < TAMANIO_ENVIO; i++) {
                offset += snprintf(payload + offset, sizeof(payload) - offset,
                    "%lld%s", tiempos[i], (i < TAMANIO_ENVIO - 1) ? "," : "");
            }

            offset += snprintf(payload + offset, sizeof(payload) - offset, "]}");

            MQTTClient_message pubmsg = MQTTClient_message_initializer;
            pubmsg.payload = payload;
            pubmsg.payloadlen = strlen(payload);
            pubmsg.qos = QOS;
            pubmsg.retained = 0;

            MQTTClient_deliveryToken token;
            MQTTClient_publishMessage(client, TOPIC, &pubmsg, &token);
            MQTTClient_waitForCompletion(client, token, TIMEOUT);

            printf("Lote de %d datos enviado!\n", TAMANIO_ENVIO);

            idx = 0; // reset
        }

        usleep(50000); // 50ms → 200 puntos en 10 segundos
    }

    MQTTClient_disconnect(client, 10000);
    MQTTClient_destroy(&client);

    return 0;
}
