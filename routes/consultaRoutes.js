const express = require("express")
const consultaControllers = require("../controllers/consultaControllers")
const router = express.Router()

router.patch("/marcar", consultaControllers.agendarConsulta) //recep marca consulta para paciente
router.post("/disponibilizar", consultaControllers.disponibilizarConsulta) //adm disponibiliza 
router.get("/listar", consultaControllers.listarConsultas) //retorna todas as consultas
router.patch("/agendar/:id_consulta", consultaControllers.marcarConsultaPaciente) //paciente marca consulta disponível

module.exports = router
