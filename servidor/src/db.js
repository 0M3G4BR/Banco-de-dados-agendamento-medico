import dotenv from "dotenv/config"
import mysql from "mysql2/promise.js"

export const pool = mysql.createPoolCluster({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, //faz
    connectionLimit: 10,
    dateStrings: true

})

export async function testarConexão(){
    await query ('SERVIDOR 1');
}