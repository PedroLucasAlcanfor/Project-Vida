//adicionar auth depois

const auth = require("../middlewares/auth")
const express = require("express")
const pacienteControllers = require("../controllers/pacienteController")
const router = express.Router()

router.get("/listar",auth , pacienteControllers.listarPaciente) // ADM lista todos os usuários
router.post("/registrar",auth, pacienteControllers.registrarPaciente)  //Colocar depois autenticação(adm e recep) e verificação de cargo(se é adm ou recepcionista)
router.post("/cadastrar", pacienteControllers.cadastrarPaciente) //Paciente faz seu cadastro
router.patch("/atualizar/:id",auth, pacienteControllers.atualizarPaciente) // ADM/Recep atualiza um paciente
router.patch("/ativar/:id",auth,  pacienteControllers.ativarPaciente) // ADM/Recep ativa um paciente
router.patch("/desativar/:id", auth, pacienteControllers.desativarPaciente) // ADM/Recep desativa um paciente



module.exports = router