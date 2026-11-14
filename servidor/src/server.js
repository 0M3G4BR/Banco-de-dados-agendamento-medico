import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { testarConexão } from './db.js'
import medicosRouter from './routes/medicos.js'
import agendamentosRouter from '.routes/agendamentos.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/medicos', medicosRouter);
app.use('/api/agendamentos', agendamentosRouter);

const PORT = process.env.PORT || 3000;

try{
    await testarConexão();
    app.listen(PORT, ()=>{
        console.log(`API rodando em https://localhost:${PORT}`)
    })
}catch (erro){
    console.log('Falha ao contectar ao MySQL', erro.message)
    process.exit(1);
};