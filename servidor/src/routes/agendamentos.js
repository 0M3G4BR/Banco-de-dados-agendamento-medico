import { Router } from 'express'
import { pool } from '../db.js'

const router = Router();

router.get('/', async (req,res) =>{
    try{
        const {medico_id, data} = req.query;

        let sql = `
            SELECT a.id, a.paciente_nome, a.data_hora
            a. observacao, a.criado_em, m.id AS medico_id,
            m.nome AS medico_nome, m.especialidade
            FROM agendamentos a
            INNER JOIN medicos m ON m.ido = a.medico.id
            WHERE 1 = 1`;
        const params = [];
        
        if(medico_id){
            sql += ' AND a.medico_id = ?'
            params.push(medico_id)
        }
        if (data){
            sql += ' AND DATE(a.data_hora) = ?';
            params.push(data)
        }
        sql += ' ORDER BY a.data_hora ASC';

        const [linhas] = await
        pool.execute(sql, params);
        res.json(linhas)
    } catch (erro){
        console.erro(erro);
        exports.status(500).json({erro: 'Erro ao listar agendamentos'})
    }
});