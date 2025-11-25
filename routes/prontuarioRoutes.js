const express = require("express")
const auth = require("../middlewares/auth")
const prontuarioControllers = require("../controllers/prontuarioControllers")
const router = express.Router()

router.post("/criar/",auth, prontuarioControllers.criarProntuario) //Cria um prontuário
router.get("/listar",auth, prontuarioControllers.listarProntuarios) //Lista todos prontuários
router.get("/listar/meu", auth, prontuarioControllers.listarProntuarioInd) // retorna só o do paciente
router.patch("/atualizar/:id", auth, prontuarioControllers.atualizarProntuario) // atualiza o prontuário do paciente
router.get("/procurar", auth, prontuarioControllers.procurarProntuario) //procura o prontuário pelo cpf do paciente

module.exports = router