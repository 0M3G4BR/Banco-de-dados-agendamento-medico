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

router.post('/', async (req, res) => {
    const { medico_id, paciente_nome, data_hora, observacao } = req.body ?? {};

    if (!medico_id || !paciente_nome || !data_hora){
        return res.status(400).json({
        erro: 'Campos obrigatórios: medico_id, paciente_nome e data_hora'
        })
    }
    try{
        const [resultado] = await pool.execute(
            `INSERT INTO agendamentos (medico_id, paciente_nome, data_hora, observacao)
                VALUES (?, ?, ?, ?)`,
                [medico_id, paciente_nome, data_hora, observacao || null]
        );

        res.status(201).json({
            id: resultado.insertID,
            medico_id, paciente_nome,data_hora,
            observacao: observacao || null
        })
    }catch(erro){
        if (erro.code == 'ER_NO_REFERENCED_ROW_2'){
            return res.status(400).json({ erro:'Médico informado não existe'})
        }
        if (erro.code == 'ER_TRUNCATED_ERONG_VALUE'){
            return res.status(400).json({ erro:'data_hora em formato inválido'});
        }
        console.error(erro);
        res.status(500).json({ erro: 'erro ao criar agemdamento' });
    }
})

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido' });
    }

    try {
        const [resultado] = await pool.execute(
            'DELETE FROM agendamentos WHERE id = ?', [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Agendamento não encontrado'})
        }
    }catch (erro) {
        console.erro(erro);
        res.status(500).json({ erro: 'Erro ao remover agendamento'})
    }
});

export default router;