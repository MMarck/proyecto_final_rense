// Ejemplo de cliente MQTT en C para enviar datos de temperatura, SpO2 y BPM

// compilar con: gcc -o ejemplo_temp_spo2_bpm ejemplos/C/ejemplo_cliente_temp_spo2_bpm.c -lpaho-mqtt3c

// luego ejecutar: ./ejemplo_temp_spo2_bpm


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include "MQTTClient.h"

#define ADDRESS     "tcp://broker.hivemq.com:1883"
#define CLIENTID    "cliente_c_temp_spo2_bpm"
#define TOPIC       "pf_rense/temp_spo2_bpm"
#define QOS         1
#define TIMEOUT     10000L

// Funcion para generar numero doble random entre min y max
double rand_double(double min, double max) {
    return min + (double)rand() / ((double)RAND_MAX / (max - min));
}

// Funcion para generar numero entero random entre min y max
int rand_int(int min, int max) {
    return min + rand() % (max - min + 1);
}

int main(int argc, char* argv[]) {
    MQTTClient client;
    MQTTClient_connectOptions conn_opts = MQTTClient_connectOptions_initializer;
    int rc;

    srand(time(NULL)); // Semilla random

    MQTTClient_create(&client, ADDRESS, CLIENTID,
        MQTTCLIENT_PERSISTENCE_NONE, NULL);
    conn_opts.keepAliveInterval = 20;
    conn_opts.cleansession = 1;

    if ((rc = MQTTClient_connect(client, &conn_opts)) != MQTTCLIENT_SUCCESS) {
        printf("Error conectando al broker, código %d\n", rc);
        return rc;
    }

    printf("Conectado al broker - Enviando datos...\n");

    while (1) {
        double temp = rand_double(20.0, 30.0); // 20 a 30
        double spo2 = rand_double(90.0, 100.0); // 90 a 100
        int bpm = rand_int(60, 120); // 60 a 120

        char payload[128];
        snprintf(payload, sizeof(payload),
            "{\"final_temp\":%.2f,\"final_spo2\":%.2f,\"final_bpm\":%d}",
            temp, spo2, bpm);

        MQTTClient_message pubmsg = MQTTClient_message_initializer;
        pubmsg.payload = payload;
        pubmsg.payloadlen = strlen(payload);
        pubmsg.qos = QOS;
        pubmsg.retained = 0;

        MQTTClient_deliveryToken token;
        MQTTClient_publishMessage(client, TOPIC, &pubmsg, &token);
        MQTTClient_waitForCompletion(client, token, TIMEOUT);

        printf("Enviado a %s: %s\n", TOPIC, payload);

        sleep(5); // Enviar cada 5 segundos
    }

    MQTTClient_disconnect(client, 10000);
    MQTTClient_destroy(&client);

    return 0;
}
