const express = require("express")
const usuarioControllers = require("../controllers/usuarioControllers")
const router = express.Router()

router.post("/cadastrar", usuarioControllers.criarUsuarios)
router.get("/", usuarioControllers.listarTodosCadastrados)
router.get("/listar", usuarioControllers.listarUsuarios)
router.patch("/atualizar/:id", usuarioControllers.atualizarUsuarios)
router.patch("/desativar/:id", usuarioControllers.desativarUsuario)
router.patch("/ativar/:id", usuarioControllers.ativarUsuario)

module.exports = router