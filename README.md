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
   ```
   /api/ultimos_valores
   ```

   ### Historial completo
   ```
   /api/historial_completo/temperatura
   /api/historial_completo/saturacion_oxigeno
   /api/historial_completo/signos_vitales
   ```

   ### Datos entre dos momentos
   ```
   /api/entre_momentos/temperatura
   /api/entre_momentos/saturacion_oxigeno
   /api/entre_momentos/signos_vitales
   ```