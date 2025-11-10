const express = require("express")
const pacienteControllers = require("../controllers/pacienteController")
const router = express.Router()

router.get("/listar", pacienteControllers.listarPaciente)
router.post("/registrar", pacienteControllers.registrarPaciente)  //Colocar depois autenticação(adm) e verificação de cargo(se é adm ou recepcionista)
router.post("/cadastrar", pacienteControllers.cadastrarPaciente)
router.patch("/atualizar/:id", pacienteControllers.atualizarPaciente)
router.patch("/ativar/:id", pacienteControllers.ativarPaciente)
router.patch("/desativar/:id", pacienteControllers.desativarPaciente)



module.exports = router