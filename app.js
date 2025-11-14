const express = require("express")
const app = express()
require("dotenv").config()
const db = require("./config/database")
const bodyParser = require("body-parser")
const usuarioRoutes = require("./routes/usuarioRoutes")
const pacienteRoutes = require("./routes/pacienteRoute")
const medicoRoutes = require("./routes/medicoRoutes")
const consultaRoutes = require("./routes/consultaRoutes")
const loginRoutes = require("./routes/loginRoute")
const triagemRoutes = require("./routes/triagemRoutes")

const cors = require('cors')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.10.212:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true }));



const PORT = process.env.PORT

app.use("/usuarios", usuarioRoutes)
app.use("/pacientes", pacienteRoutes)
app.use("/medicos", medicoRoutes)
app.use("/consultas", consultaRoutes)
app.use("/auth", loginRoutes)
app.use("/triagem", triagemRoutes)

app.listen(PORT,"0.0.0.0", () => {
    console.log("Servidor funcionando normalmente")
})