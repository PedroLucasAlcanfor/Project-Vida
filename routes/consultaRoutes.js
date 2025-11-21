//adicionar auth nas que faltam depois


const express = require("express")
const consultaControllers = require("../controllers/consultaControllers")
const auth = require("../middlewares/auth")
const router = express.Router()

router.patch("/agendar/:id_consulta",auth, consultaControllers.agendarConsulta) //recep marca consulta para paciente
router.post("/disponibilizar", auth, consultaControllers.disponibilizarConsulta) //adm disponibiliza 
router.get("/listar", auth, consultaControllers.listarConsultas) //retorna todas as consultas
router.patch("/marcar/:id_consulta", auth, consultaControllers.marcarConsultaPaciente) //paciente marca consulta disponível
router.patch("/desmarcar/:id_consulta", auth, consultaControllers.desmarcarConsulta) //desmarcar consulta 
router.patch("/finalizar/:id_consulta",auth,  consultaControllers.finalizarConsulta)
router.post("/emergencia/marcar", auth, consultaControllers.criarEmergencia) //recepcionista ou adm marca consulta
router.get("/diarias/listar", auth, consultaControllers.listarConsultasDiarias) //Lista todas as consultas diárias (para o dashboard)
router.get("/relatorios",auth, consultaControllers.relatorioConsultas)


module.exports = router
