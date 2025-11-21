

const express = require("express")
const triagemControllers = require("../controllers/triagemControllers")
const auth = require("../middlewares/auth")
const router = express.Router()

router.post("/criar/:id_consulta", auth, triagemControllers.criarTriagem) // ADM/Médico cria uma triagem
router.get("/listar",auth, triagemControllers.listarTriagens) //ADM lista todas as triagens feitas
router.patch("/atualizar/:id_triagem", auth, triagemControllers.atualizarTriagem) // ADM/Médico atualiza a triagem pelo

module.exports = router
