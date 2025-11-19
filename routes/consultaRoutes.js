//adicionar auth nas que faltam depois


const express = require("express")
const consultaControllers = require("../controllers/consultaControllers")
const auth = require("../middlewares/auth")
const router = express.Router()

router.patch("/agendar/:id_consulta", consultaControllers.agendarConsulta) //recep marca consulta para paciente
router.post("/disponibilizar", consultaControllers.disponibilizarConsulta) //adm disponibiliza 
router.get("/listar", consultaControllers.listarConsultas) //retorna todas as consultas
router.patch("/marcar/:id_consulta", auth, consultaControllers.marcarConsultaPaciente) //paciente marca consulta disponível
router.patch("/desmarcar/:id_consulta", auth, consultaControllers.desmarcarConsulta) //desmarcar consulta 
router.post("/emergencia/marcar", auth, consultaControllers.criarEmergencia) //recepcionista ou adm marca consulta
router.get("/diarias/listar", consultaControllers.listarConsultasDiarias) //Lista todas as consultas diárias (para o dashboard)
router.get("/relatorios", consultaControllers.relatorioConsultas)


module.exports = router
