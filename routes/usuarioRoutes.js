const express = require("express")
const usuarioControllers = require("../controllers/usuarioControllers")
const router = express.Router()
const auth = require("../middlewares/auth")

router.post("/cadastrar",auth, usuarioControllers.criarUsuarios)
router.get("/",auth, usuarioControllers.listarTodosCadastrados)
router.get("/listar", auth, usuarioControllers.listarUsuarios)
router.patch("/atualizar/:id", auth, usuarioControllers.atualizarUsuarios)
router.patch("/desativar/:id", auth, usuarioControllers.desativarUsuario)
router.patch("/ativar/:id", auth, usuarioControllers.ativarUsuario)

module.exports = router