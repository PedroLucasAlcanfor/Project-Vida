const express = require("express")
const loginControllers = require("../controllers/loginControllers")
const router = express.Router()

router.post("/login", loginControllers.login) //gera o token ao logar

module.exports = router
