const express = require("express")
const medicoControllers = require("../controllers/medicoController")
const router = express.Router()

router.post("/cadastrar", medicoControllers.criarMedico)
router.get("/listar", medicoControllers.listarMedicos)
router.patch("/atualizar/:id", medicoControllers.atualizarMedicos)
router.patch("/ativar/:id", medicoControllers.ativarMedicos)
router.patch("/desativar/:id", medicoControllers.desativarMedicos)


module.exports = router