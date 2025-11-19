const express = require("express")
const auth = require("../middlewares/auth")
const prontuarioControllers = require("../controllers/prontuarioControllers")
const router = express.Router()

router.post("/criar/:id_paciente", prontuarioControllers.criarProntuario) //Cria um prontuário
router.get("/listar", prontuarioControllers.listarProntuarios) //Lista todos prontuários
router.get("/listar/meu", auth, prontuarioControllers.listarProntuarioInd) // retorna só o do paciente
router.patch("/atualizar/:id_paciente", auth, prontuarioControllers.atualizarProntuario)


module.exports = router