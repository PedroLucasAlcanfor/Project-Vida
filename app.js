const express = require("express")
const app = express()
require("dotenv").config()
const db = require("./config/database")
const bodyParser = require("body-parser")
const usuarioRoutes = require("./routes/usuarioRoutes")
const pacienteRoutes = require("./routes/pacienteRoute")
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT

app.use("/usuarios", usuarioRoutes)
app.use("/paciente", pacienteRoutes)

app.listen(PORT, () => {
    console.log("Servidor funcionando normalmente")
})