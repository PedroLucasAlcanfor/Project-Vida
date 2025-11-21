//adicionar auth depois


const express = require("express")
const medicoControllers = require("../controllers/medicoController")
const router = express.Router()
const auth = require("../middlewares/auth")

router.post("/cadastrar",auth, medicoControllers.criarMedico) //ADM cadastra um médico
router.get("/listar",auth, medicoControllers.listarMedicos) //ADM busca todos os médicos
router.patch("/atualizar/:id",auth, medicoControllers.atualizarMedicos) //ADM atualiza um médico
router.patch("/ativar/:id",auth, medicoControllers.ativarMedicos) //ADM ativa um médico específico
router.patch("/desativar/:id",auth, medicoControllers.desativarMedicos) //ADM desativa um médico específico


module.exports = router