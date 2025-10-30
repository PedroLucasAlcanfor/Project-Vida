const express = require("express")
const pacienteControllers = require("../controllers/pacienteController")
const router = express.Router()

router.post("/registrar", pacienteControllers.registrarPaciente)  //Colocar depois autenticação(adm) e verificação de cargo(se é adm ou recepcionista)
router.post("/cadastrar", pacienteControllers.cadastrarPaciente)

module.exports = router
