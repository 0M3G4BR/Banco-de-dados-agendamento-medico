 import { Router } from 'express'
 import { pool } from '../db.js'

 const router = Router();

 router.get('/', async (req, res) => {
    try{
        const [linhas] = await pool.execute(
            'SELECT id, nome, especialidade FROM medicos ORDER BY nome',
        )
            res.json(linhas)
        
    }catch (error){
        res.status(505).json({erro: 'Erro ao buscar o médico requisitado'})

    }
 });

 export default router;