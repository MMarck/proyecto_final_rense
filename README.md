## Instalación y pruebas

1. **Clonar o descargar el repositorio**

2. **Instalar las dependencias necesarias**  
   Ejecuta el siguiente comando:
   ```bash
   npm install --save-dev nodemon
   ```

3. **Configurar las variables de entorno**  
   - Leer el archivo `ejemplo_env`
   - Configurar las variables para la conexión a la base de datos **PostgreSQL**
   - El usuario configurado debe tener permisos para **crear bases de datos**

4. **Verificar y crear la base de datos**  
   Ejecutar el archivo `verificar_crear_bd.js` para comprobar la conexión y crear la estructura necesaria:
   ```bash
   node verificar_crear_bd.js
   ```

5. **Iniciar el servidor**
   ```bash
   node app.js
   ```

6. **Probar el funcionamiento del servidor**  
   Ejecutar alguno de los scripts de ejemplo.  
   Estos envían datos periódicamente al broker público `mqtt://broker.hivemq.com`, los cuales son recibidos y almacenados por el servidor privado. Para probar el funcionamiento se disponen 2 ejemplos en 2 lenguajes (javascript y C) uno de los ejemplos envia periodicamente datos de temperatura, oxigeno en sangre y poulsaciones por minuto, mientras el otro envia 2 arreglos (uno de valores y otro de tiempo) simulando una lectura de electro cardiograma:

   - `ejemplo_cliente_temp_spo2_bpm`
   - `ejemplo_cliente_signos_vitales_ecg`

7. **Verificar los datos almacenados**  
   Acceder a las siguientes rutas de la API:

   ### Últimos valores registrados
   Con esta ruta se pueden consultar los últimos valores recibidos. y almacenados temporalmente en memoria volátil (RAM) del servidor
   ```
   /api/ultimos_valores
   ```
   A continuaciones se agrega un ejemplo:
   ```
   {"temperatura":"23.78","saturacion_oxigeno":"97.37","pulsaciones_por_minuto":113,"signos_vitales_ecg":{"valores":[84,...,68],"tiempos":[1769127025246,...,1769127035229]},"triage":"intermedio"}
   ```

   ### Historial completo
   Esta ruta permite recuperar todos los datos de una tabla. 

   ```
   /api/historial_completo/temperatura
   /api/historial_completo/saturacion_oxigeno
   /api/historial_completo/pulsaciones_por_minuto
   /api/historial_completo/signos_vitales
   /api/historial_completo/triage
   ```

   Se puede usar la variable "limite" para reducir la cantidad de valores que se desee consultar, a continuacion un ejemplo:

   ```
   /api/historial_completo/temperatura?limite=20
   ```


   ### Datos entre dos momentos (Sólo para signos vitales ECG)
   Esta ruta permite consultar los valores de signos vitales, pero limitando a cierto rango de tiempo. A continuación se colocan algunos ejemplos de uso: 
   ```
   /api/signos_vitales_ecg/entre_momentos/
   /api/signos_vitales_ecg/entre_momentos/?inicio=2024-01-01T00:00:00Z
   /api/signos_vitales_ecg/entre_momentos/?fin=2024-01-01T00:00:00Z
   /api/signos_vitales_ecg/entre_momentos/?inicio=2024-01-01T00:00:00Z&fin=2024-01-31T23:59:59Z
   ```