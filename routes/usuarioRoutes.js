const express = require("express")
const usuarioControllers = require("../controllers/usuarioControllers")
const router = express.Router()
const auth = require("../middlewares/auth")

router.post("/cadastrar",auth, usuarioControllers.criarUsuarios) // ADM cadastra outros usuários
router.get("/",auth, usuarioControllers.listarTodosCadastrados) // lista todos os cadastrados
router.get("/listar", auth, usuarioControllers.listarUsuarios) // lista todos os usuarios
router.patch("/atualizar/:id", auth, usuarioControllers.atualizarUsuarios) // ADM atualiza usuário pelo id
router.patch("/desativar/:id", auth, usuarioControllers.desativarUsuario) // ADM desativa usuário pelo id
router.patch("/ativar/:id", auth, usuarioControllers.ativarUsuario) // ADM ativa usuário pelo id

module.exports = router