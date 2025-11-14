const Medicos = require("../models/Medico");
const Joi = require("joi");
const db = require("../config/database");
const Pacientes = require("../models/Pacientes");
const Usuarios = require("../models/Usuarios");
const Consultas = require("../models/Consultas");


const agendarConsultaSchema = Joi.object({

    cpf: Joi.string().pattern(/^\d{11}$/).required()
    .messages({
    "string.pattern.base": "O CPF deve conter exatamente 11 dígitos numéricos.",
    "any.required": "O CPF do paciente é obrigatório."
    }),
    prioridade: Joi.string().valid("Alta", "Média", "Baixa", "N/D").optional()
    .messages({
    "any.only": "A prioridade deve ser 'Alta', 'Média', 'Baixa' ou 'N/D'."
    })
});

const disponibilizarConsultaSchema = Joi.object({
    nomeDoutor: Joi.string().trim().min(3).required()
    .messages({
    "string.empty": "O nome do doutor é obrigatório.",
    "string.min": "O nome do doutor deve ter pelo menos 3 caracteres.",
    "any.required": "O campo nomeDoutor é obrigatório."
    }),

   especialidadeConsulta: Joi.string().trim().valid('Cardiologista', 'Neurologista', 'Ortopedista', 'Emergencista', 'Psicólogo', 'Pneumologista', 'Urologista', 'Ginecologista').required()
    .messages({
      "string.empty": "A especialidade não pode ser vazia",
      "any.required": "A especialidade é obrigatória",
      "any.only": "Especialidade deve ser Cardiologista, Neurologista, Ortopedista, Emergencista, Psicólogo, Pneumologista, Urologista, Ginecologista"
    }),

    data: Joi.date().iso().required().messages({
    "date.base": "A data deve estar em formato válido (ISO).",
    "any.required": "A data da consulta é obrigatória."
    }),

    horario: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "O horário deve estar no formato HH:MM (ex: 14:30).",
      "any.required": "O horário é obrigatório."
    }),
});

const marcarConsultaPacienteSchema = Joi.object({
  id_consulta: Joi.number().integer().required()
    .messages({
    "number.base": "O ID da consulta deve ser um número.",
    "any.required": "O ID da consulta é obrigatório."
    })
});
const criarEmergenciaSchema = Joi.object({
  cpf: Joi.string()
    .pattern(/^\d{11}$/)
    .required()
    .messages({
      "string.pattern.base": "O CPF deve conter exatamente 11 dígitos numéricos.",
      "any.required": "O CPF do paciente é obrigatório."
    }),

  nomeDoutor: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      "string.empty": "O nome do doutor é obrigatório.",
      "string.min": "O nome do doutor deve ter pelo menos 3 caracteres.",
      "any.required": "O campo nomeDoutor é obrigatório."
    }),

  especialidadeConsulta: Joi.string()
    .trim()
    .valid(
      "Emergencista",
    ).required()
    .messages({
      "string.empty": "A especialidade não pode ser vazia.",
      "any.only": "Especialidade inválida.",
      "any.required": "O campo especialidadeConsulta é obrigatório."
    }),

  data: Joi.date()
    .iso()
    .optional()
    .messages({
      "date.base": "A data deve estar em formato válido (ISO)."
    }),

  horario: Joi.string()
    .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      "string.pattern.base": "O horário deve estar no formato HH:MM (ex: 14:30)."
    }),
  status: Joi.string().valid("Agendada")
});



module.exports = {

  // ADM acessa todas as consultas disponíveis no sistema
  async listarConsultas(req, res) {
    try {
      const consultas = await Consultas.findAll();

      const consultasFormatadas = consultas.map(c => {
        const dataBr = new Date(c.data).toLocaleDateString("pt-BR");
        return { ...c.toJSON(), data: dataBr };
      });
    

      res.json(consultasFormatadas);
    } catch (erro) {
      console.error("Erro ao listar consultas:", erro);
      res.status(500).json({ msg: "Erro ao listar consultas." });
    }
  },

//Lista todas as consultas diárias (para o dashboard)
async listarConsultasDiarias(req, res) {
  try {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0); 

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999); 

    const consultas = await Consultas.findAll({
      where: {
        data: {
          [db.Sequelize.Op.between]: [inicioDoDia, fimDoDia]
        }
      },
  
      order: [["horario", "ASC"]]
    });

    if (consultas.length === 0)
      return res.status(404).json({ msg: "Nenhuma consulta marcada para hoje." });

    res.status(200).json({
      msg: "Consultas do dia encontradas com sucesso!",
      total: consultas.length,
      consultas
    });
  } catch (erro) {
    console.error("Erro ao listar consultas diárias:", erro);
    res.status(500).json({ msg: "Erro ao buscar consultas diárias." });
  }
}, 

  // Recepcionista agenda uma consulta
  async agendarConsulta(req, res) {
    try {

      const {id_consulta} = req.params
      const { error, value } = agendarConsultaSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const mensagens = error.details.map(d => d.message);
        return res.status(400).json({ erros: mensagens });
      }

      const {  cpf, prioridade } = value;

      const consulta = await Consultas.findOne({ where: { id_consulta } });
      if (!consulta) return res.status(404).json({ msg: "Consulta não encontrada." });

      if (consulta.status !== "Disponível") {
        return res.status(400).json({ msg: "Essa consulta já foi agendada ou finalizada." });
      }

      const paciente = await Pacientes.findOne({ where: { cpf } });
      if (!paciente) return res.status(404).json({ msg: "Paciente não encontrado." });

      consulta.status = "Agendada";
      if (prioridade) consulta.prioridade = prioridade;
      consulta.id_paciente = paciente.id_paciente;
      await consulta.save();

      const dataBr = new Date(consulta.data).toLocaleDateString("pt-BR");

      res.json({
        msg: "Consulta agendada com sucesso!",
        consulta: { ...consulta.toJSON(), data: dataBr },
      });
    } catch (erro) {
      console.error("Erro ao agendar consulta:", erro);
      res.status(500).json({ msg: "Erro ao agendar consulta." });
    }
  },

  //  Paciente marca uma consulta
async marcarConsultaPaciente(req, res) {
  try {
    const { error } = marcarConsultaPacienteSchema.validate(req.params, { abortEarly: false });
    if (error) {
      const mensagens = error.details.map(d => d.message);
      return res.status(400).json({ erros: mensagens });
    }

    const { id_consulta } = req.params;
    const usuario = req.usuario;
    let idPaciente;

    if (usuario.tipo === "paciente") {
      idPaciente = usuario.id;
    }       
    else if (usuario.tipo === "admin") {
      const { cpf } = req.body;

      if (!cpf) return res.status(400).json({ msg: "CPF do paciente é obrigatório para o admin." });

  const paciente = await Pacientes.findOne({ where: { cpf } });
  if (!paciente) return res.status(404).json({ msg: "Paciente não encontrado." });

  idPaciente = paciente.id_paciente;
    } 
    else {
      return res.status(403).json({ msg: "Você não tem permissão para marcar consultas." });
    }

    const consulta = await Consultas.findByPk(id_consulta);
    if (!consulta) return res.status(404).json({ msg: "Consulta não encontrada." });
    if (consulta.status !== "Disponível") return res.status(400).json({ msg: "Consulta indisponível." });

    await consulta.update({
      status: "Agendada",
      id_paciente: idPaciente
    });

    res.json({ msg: "Consulta marcada com sucesso!", consulta });
  } catch (erro) {
    console.error("Erro ao marcar consulta:", erro);
    res.status(500).json({ msg: "Erro ao marcar consulta." });
  }
},

  // ADM disponibiliza uma nova consulta
  async disponibilizarConsulta(req, res) {
    try {
      const { error, value } = disponibilizarConsultaSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const mensagens = error.details.map(d => d.message);
        return res.status(400).json({ erros: mensagens });
      }

      const { nomeDoutor, especialidadeConsulta, data, horario } = value;

      const medico = await Medicos.findOne({ where: { nome: nomeDoutor } });
      if (!medico) return res.status(404).json({ msg: "Médico não encontrado." });

      const consultaExistente = await Consultas.findOne({ where: { nomeDoutor, data, horario } });
      if (consultaExistente)
        return res.status(400).json({ msg: "Esse horário já está ocupado para esse médico." });

      const novaConsulta = await Consultas.create({
        nomeDoutor,
        especialidadeConsulta,
        data,
        horario,
        status: "Disponível",
        prioridade: "N/D",
      });

      const dataFormatada = new Date(novaConsulta.data).toLocaleDateString("pt-BR");

      res.status(201).json({
        msg: "Consulta disponibilizada com sucesso!",
        consulta: { ...novaConsulta.toJSON(), data: dataFormatada },
      });
    } catch (erro) {
      console.error("Erro ao disponibilizar consulta:", erro);
      res.status(500).json({ msg: "Erro ao disponibilizar consulta." });
    }
  },
  async criarEmergencia(req, res) {
  try {
    const usuario = req.usuario;

    if (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista") {
      return res.status(403).json({
        msg: "Apenas administradores ou recepcionistas podem criar consultas de emergência."
      });
    }

    const { error, value } = criarEmergenciaSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const mensagens = error.details.map(d => d.message);
      return res.status(400).json({ erros: mensagens });
    }

    const { cpf, nomeDoutor, especialidadeConsulta, data, horario } = value;

    const paciente = await Pacientes.findOne({ where: { cpf } });
    if (!paciente) return res.status(404).json({ msg: "Paciente não encontrado." });

    const medico = await Medicos.findOne({
      where: { nome: nomeDoutor, especialidade: especialidadeConsulta }
    });
    if (!medico) return res.status(404).json({ msg: "Médico não encontrado." });

    const consultaExistente = await Consultas.findOne({
      where: {
        id_paciente: paciente.id_paciente,
        especialidadeConsulta: "Emergencista",
        status: "Agendada"        
      }
    })
    if(consultaExistente) return res.status(409).json({msg:"O paciente já possui uma emergência em andamento"})

    const novaConsulta = await Consultas.create({
      nomeDoutor,
      especialidadeConsulta: "Emergencista",
      data: data || new Date(),
      horario:
        horario ||
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      prioridade: "Emergência",
      status: "Agendada",
      id_paciente: paciente.id_paciente
    });

    const dataBr = new Date(novaConsulta.data).toLocaleDateString("pt-BR");

    res.status(201).json({
      msg: "Consulta de emergência criada com sucesso!",
      consulta: { ...novaConsulta.toJSON(), data: dataBr }
    });
  } catch (erro) {
    console.error("Erro ao criar emergência:", erro);
    res.status(500).json({ msg: "Erro ao criar consulta de emergência." });
  }
},


// Paciente desmarcar suas consultas
  async desmarcarConsultaPaciente(req, res) {
  try {
    const { id_consulta } = req.params;
    const usuario = req.usuario;

    if (usuario.tipo !== "paciente") {
      return res.status(403).json({ msg: "Apenas pacientes podem usar esta rota." });
    }

    const consulta = await Consultas.findByPk(id_consulta);
    if (!consulta) return res.status(404).json({ msg: "Consulta não encontrada." });

    if (consulta.id_paciente !== usuario.id) {
      return res.status(403).json({ msg: "Você só pode desmarcar suas próprias consultas." });
    }

    if (consulta.status === "Disponível") {
      return res.status(409).json({ msg: "Consulta já está desmarcada." });
    }

    await consulta.update({ status: "Disponível", id_paciente: null });
    res.json({ msg: "Consulta desmarcada com sucesso." });
  } catch (erro) {
    console.error("Erro ao desmarcar consulta do paciente:", erro);
    res.status(500).json({ msg: "Erro ao desmarcar consulta." });
  }
},
// ADM/Recep desmarca consultas de outros usuários
async desmarcarConsultaAdmin(req, res) {
  try {
    const { id_consulta } = req.params;
    const usuario = req.usuario;

    if (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista") {
      return res.status(403).json({ msg: "Apenas administradores ou recepcionistas podem desmarcar consultas de outros." });
    }

    const consulta = await Consultas.findByPk(id_consulta);
    if (!consulta) return res.status(404).json({ msg: "Consulta não encontrada." });

    if (consulta.status === "Disponível") {
      return res.status(409).json({ msg: "Consulta já está desmarcada." });
    }

    await consulta.update({ status: "Disponível", id_paciente: null });
    res.json({ msg: "Consulta desmarcada com sucesso pelo administrador/recepcionista." });
  } catch (erro) {
    console.error("Erro ao desmarcar consulta (admin):", erro);
    res.status(500).json({ msg: "Erro ao desmarcar consulta." });
  }
}

};
