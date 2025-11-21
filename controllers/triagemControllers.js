const Joi = require("joi");
const Triagens = require("../models/Triagens");
const Consultas = require("../models/Consultas");
const Medicos = require("../models/Medico");
const Usuarios = require("../models/Usuarios");

const criarTriagemSchema = Joi.object({
  nomeMedico: Joi.string().trim().required()
  .messages({
    "any.required": "O nome do médico responsável é obrigatório para admins.",
    "string.empty": "O nome do médico não pode ser vazio."
  }),
  pressao: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/).required()
    .messages({
      "string.pattern.base": "A pressão deve estar no formato correto (ex: 120/80).",
      "any.required": "O campo pressão é obrigatório.",
      "string.empty": "O campo de pressão não pode ser nulo"
    }),

  temperatura: Joi.number().min(30).max(45).required()
    .messages({
      "number.base": "A temperatura deve ser numérica.",
      "number.min": "Temperatura mínima válida é 30 *C.",
      "number.max": "Temperatura máxima válida é 45 *C .",
    "any.required": "O campo temperatura é obrigatório.",
    "string.empty": "O campo de temperatura não pode ser nulo"

    }),

  batimentos: Joi.number().min(30).max(220).required()
    .messages({
      "number.base": "Os batimentos devem ser numéricos.",
      "number.min": "Batimentos mínomo válido: 30.",
      "number.max": "Batimentos muito altos.",
      "any.required": "O campo batimentos é obrigatório.",
      "string.empty": " o campo de batimentos não pode ser nulo"
    }),

  sintomas: Joi.string().trim().min(3).required()
    .messages({
      "string.empty": "O campo sintomas não pode ser nulo",
      "string.min": "Os sintomas devem ter pelo menos 3 caracteres.",
      "any.required": "O campo sintomas é obrigatório."

    }),

  observacoes: Joi.string().trim().allow("", null)
});
const atualizarTriagemSchema = Joi.object({
  nome: Joi.string(),
 pressao: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/)
    .messages({
      "string.pattern.base": "A pressão deve estar no formato correto (ex: 120/80).",
      "any.required": "O campo pressão é obrigatório.",
      "string.empty": "O campo de pressão não pode ser nulo"
    }),

  temperatura: Joi.number().min(30).max(45)
    .messages({
      "number.base": "A temperatura deve ser numérica.",
      "number.min": "Temperatura mínima válida é 30 *C.",
      "number.max": "Temperatura máxima válida é 45 *C .",
    "any.required": "O campo temperatura é obrigatório.",
    "string.empty": "O campo de temperatura não pode ser nulo"

    }),

  batimentos: Joi.number().min(30).max(220)
    .messages({
      "number.base": "Os batimentos devem ser numéricos.",
      "number.min": "Batimentos mínomo válido: 30.",
      "number.max": "Batimentos muito altos.",
      "any.required": "O campo batimentos é obrigatório.",
      "string.empty": " o campo de batimentos não pode ser nulo"
    }),

  sintomas: Joi.string().trim().min(3)
    .messages({
      "string.empty": "O campo sintomas não pode ser nulo",
      "string.min": "Os sintomas devem ter pelo menos 3 caracteres.",
      "any.required": "O campo sintomas é obrigatório."

    }),

  observacoes: Joi.string().trim().allow("", null)
}).min(1);  


module.exports = {
    //ADM lista todas as triagens 
    async listarTriagens(req, res) {
    try {
      const usuario = req.usuario
      if (!usuario || usuario.tipo !== "admin") {
       return res.status(401).json({ msg: "Somente admins podem acessar essa rota" });
      }

      const triagem = await Triagens.findAll();

      res.json(triagem);
    } catch (erro) {
      console.error("Erro ao listar consultas:", erro);
      res.status(500).json({ msg: "Erro ao listar consultas." });
    }
  },
// Médico lista somente as triagens feitas por ele
async listarTriagensMedico(req, res) {
  try {
    const usuario = req.usuario;

    if (!usuario || usuario.tipo !== "medico") {
      return res.status(403).json({ msg: "Acesso negado. Somente médicos podem ver suas triagens." });
    }

    const idMedico = usuario.id;

    const triagens = await Triagens.findAll({
      where: { id_medico_responsavel: idMedico },
      order: [["id_triagem", "DESC"]] 
    });

    if (!triagens.length) {
      return res.status(200).json({ msg: "Nenhuma triagem encontrada para este médico." });
    }

    return res.json(triagens);

  } catch (erro) {
    console.error("Erro ao listar triagens do médico:", erro);
    return res.status(500).json({ msg: "Erro ao listar triagens." });
  }
},
  // Médico/adm cria triagem de uma consulta existente
 async criarTriagem(req, res) {
  try {
    const { error, value } = criarTriagemSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const mensagens = error.details.map(d => d.message);
      return res.status(400).json({ erros: mensagens });
    }

    const usuario = req.usuario;

    if (!usuario || (usuario.tipo !== "medico" && usuario.tipo !== "admin")) {
      return res.status(401).json({ msg: "Somente médicos e admins podem acessar essa rota." });
    }

    const { id_consulta } = req.params;
    const { pressao, temperatura, batimentos, sintomas, observacoes, nomeMedico } = value;

    const consulta = await Consultas.findByPk(id_consulta);
    if (!consulta)
      return res.status(404).json({ msg: "Consulta não encontrada." });

    if (consulta.especialidadeConsulta !== "Emergencista")
      return res.status(400).json({ msg: "A triagem só pode ser vinculada a uma emergência." });

    if (consulta.status !== "Agendada")
      return res.status(400).json({ msg: "A triagem só pode ser criada para emergências agendadas." });

    let id_medico_responsavel = null;

    if (usuario.tipo === "medico") {

      const medico = await Medicos.findOne({ where: { id_medico: usuario.id } });
      if (!medico)
        return res.status(404).json({ msg: "Médico não encontrado." });

      if (medico.nome !== consulta.nomeDoutor)
        return res.status(403).json({ msg: "A triagem deve ser feita pelo médico responsável." });

      if (medico.especialidade !== "Emergencista")
        return res.status(403).json({ msg: "Somente emergencistas podem criar triagem." });

      id_medico_responsavel = medico.id_medico;
    }

    if (usuario.tipo === "admin") {

      if (!nomeMedico)
        return res.status(400).json({ msg: "O admin deve informar o nome do médico responsável." });

      const medico = await Medicos.findOne({ where: { nome: nomeMedico } });

      if (!medico)
        return res.status(404).json({ msg: "Médico informado não encontrado." });

      if (medico.especialidade !== "Emergencista")
        return res.status(403).json({ msg: "O médico informado deve ser emergencista." });

      if (medico.nome !== consulta.nomeDoutor)
        return res.status(403).json({ msg: "O médico informado não é o responsável por esta emergência." });

      id_medico_responsavel = medico.id_medico;
    }

    if (!id_medico_responsavel) {
      return res.status(500).json({
        msg: "Erro interno: id_medico_responsavel não foi definido."
      });
    }

    const triagemExistente = await Triagens.findOne({ where: { id_consulta } });
    if (triagemExistente)
      return res.status(409).json({ msg: "Já existe uma triagem registrada para essa emergência." });

    const novaTriagem = await Triagens.create({
      id_consulta: Number(id_consulta),
      id_medico_responsavel,
      pressao,
      temperatura,
      batimentos,
      sintomas,
      observacoes
    });

    return res.status(201).json({
      msg: "Triagem criada com sucesso!",
      triagem: novaTriagem
    });

  } catch (erro) {
    console.error("Erro ao criar triagem:", erro);
    return res.status(500).json({ msg: "Erro ao criar triagem." });
  }
},

  //Médico responsável pela emergência atualiza a triagem
  //ADM atualiza a triagem mas deve fornecer o nome do ADM responsável pela triagemm
 async atualizarTriagem(req, res) {
  try {
    const { id_triagem } = req.params;
    const usuario = req.usuario;

    const { error, value } = atualizarTriagemSchema.validate(
      req.body,
      { abortEarly: false, context: { tipoUsuario: usuario.tipo } }
    );

    if (error) {
      const mensagens = error.details.map(d => d.message);
      return res.status(400).json({ erros: mensagens });
    }

    const triagem = await Triagens.findByPk(id_triagem);
    if (!triagem)
      return res.status(404).json({ msg: "Triagem não encontrada." });

    const consulta = await Consultas.findByPk(triagem.id_consulta);
    if (!consulta)
      return res.status(404).json({ msg: "Consulta vinculada não encontrada." });

    if (consulta.especialidadeConsulta !== "Emergencista") {
      return res.status(400).json({ msg: "Somente emergências possuem triagem." });
    }

    if (consulta.status === "Finalizada") {
      return res.status(400).json({ msg: "Não é possível atualizar triagem finalizada." });
    }

    let id_medico_responsavel = null;

    if (usuario.tipo === "admin") {
      const { nome } = req.body;

      const medico = await Medicos.findOne({ where: { nome } });

      if (!medico) {
        return res.status(404).json({ msg: "Médico informado não encontrado." });
      }

      if (medico.especialidade !== "Emergencista") {
        return res.status(400).json({
          msg: "O médico informado deve ser emergencista."
        });
      }

      if (medico.nome !== consulta.nomeDoutor) {
        return res.status(403).json({
          msg: "O médico informado não é o responsável por esta emergência."
        });
      }

      id_medico_responsavel = medico.id_medico;
    }

    if (usuario.tipo === "medico") {
      const medico = await Medicos.findOne({
        where: { id_medico: usuario.id }
      });

      if (!medico)
        return res.status(404).json({ msg: "Médico não encontrado." });

      if (medico.nome !== consulta.nomeDoutor) {
        return res.status(403).json({
          msg: "Somente o médico responsável pela consulta pode atualizar a triagem."
        });
      }

      if (medico.especialidade !== "Emergencista") {
        return res.status(403).json({
          msg: "Somente médicos emergencistas podem atualizar triagens."
        });
      }

      id_medico_responsavel = medico.id_medico;
    }

    if (usuario.tipo !== "admin" && usuario.tipo !== "medico") {
      return res.status(403).json({
        msg: "Somente médicos e administradores podem atualizar triagens."
      });
    }

    const dadosAtualizar = {
      ...value,
      id_medico_responsavel
    };

    await triagem.update(dadosAtualizar);

    return res.status(200).json({
      msg: "Triagem atualizada com sucesso!",
      triagem
    });

  } catch (erro) {
    console.error("Erro ao atualizar triagem:", erro);
    return res.status(500).json({ msg: "Erro ao atualizar triagem." });
  }
}

};


