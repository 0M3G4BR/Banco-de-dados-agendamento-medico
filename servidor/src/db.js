import dotenv from "dotenv/config"
import mysql from "mysql2/promise.js"

console.log(process.env.DB_USER, process.env.DB_PORT, process.env.DB_PASSWORD?.length);

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, 
    connectionLimit: 10,
    dateStrings: true

})

export async function testarConexao(){
    await pool.query ('SELECT 1');
}