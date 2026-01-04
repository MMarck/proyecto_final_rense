// Este script verifica si la base de datos con el nombre definido
// en el archivo .env existe y si no, la crea junto con las tablas 
// necesarias.
const { Client, Pool } = require('pg');
require('dotenv').config();


// Configuración de conexión (primero ajustar archivo .env, usar ejemplo)
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
};



async function setupDatabase() {
    // 1. Conectar a la DB por defecto para verificar si existe la nuestra
    const client = new Client({ ...dbConfig, database: 'postgres' });
    await client.connect();

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'proyecto_rense_db'");
    
    if (res.rowCount === 0) {
        console.log("La base de datos no existe. Creándola...");
        await client.query('CREATE DATABASE proyecto_rense_db');
    }
    await client.end();

    // 2. Conectar a la base de datos ya creada
    pool = new Pool({ ...dbConfig, database: 'proyecto_rense_db' });

    // 3. Crear tablas si no existen
    const createTablesQuery = `
    
        CREATE TABLE IF NOT EXISTS temperatura (
            id SERIAL PRIMARY KEY,
            valor FLOAT,
            timestamp TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS saturacion_oxigeno (
            id SERIAL PRIMARY KEY,
            valor FLOAT,
            timestamp TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS signos_vitales (
            id SERIAL PRIMARY KEY,
            pulso INTEGER,
            timestamp TIMESTAMPTZ DEFAULT NOW()
        );
    `;
    await pool.query(createTablesQuery);
    console.log("\x1b[32m%s\x1b[0m", "Base de datos y tablas listas.");
}

setupDatabase().catch(console.error);

