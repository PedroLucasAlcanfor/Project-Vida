//adicionar auth depois


const express = require("express")
const medicoControllers = require("../controllers/medicoController")
const router = express.Router()

router.post("/cadastrar", medicoControllers.criarMedico) //ADM cadastra um médico
router.get("/listar", medicoControllers.listarMedicos) //ADM busca todos os médicos
router.patch("/atualizar/:id", medicoControllers.atualizarMedicos) //ADM atualiza um médico
router.patch("/ativar/:id", medicoControllers.ativarMedicos) //ADM ativa um médico específico
router.patch("/desativar/:id", medicoControllers.desativarMedicos) //ADM desativa um médico específico


module.exports = router