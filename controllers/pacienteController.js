//ADICIONAR O BCRYPT A CADA TIPO DE CRIAÇÃO DE USUARIO

const Pacientes = require("../models/Pacientes");
const Usuarios = require("../models/Usuarios");
const Medicos = require("../models/Medico");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const db = require("../config/database");

const criarPacienteSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100)
    .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .required()
    .messages({
      "string.empty": "O nome é obrigatório.",
      "string.min": "O nome deve ter no mínimo 5 caracteres.",
      "string.max": "O nome pode ter no máximo 100 caracteres.",
      "string.pattern.base": "O nome deve conter apenas letras e espaços.",
      "any.required": "O nome é obrigatório."
    }),

  genero: Joi.string().valid("M", "F", "X").required()
    .messages({
      "any.only": "O gênero deve ser 'M', 'F' ou 'X'.",
      "any.required": "O gênero é obrigatório."
    }),

  email: Joi.string().trim()
    .pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/)
    .required()
    .messages({
      "string.empty": "O e-mail é obrigatório.",
      "string.pattern.base": "O e-mail deve ser um Gmail válido.",
      "any.required": "O e-mail é obrigatório."
    }),

  senha: Joi.string().trim().length(6).required()
    .messages({
      "string.empty": "A senha é obrigatória.",
      "string.length": "A senha deve ter exatamente 6 caracteres.",
      "any.required": "A senha é obrigatória."
    }),

  cpf: Joi.string().trim().pattern(/^\d{11}$/).required()
    .messages({
      "string.empty": "O CPF é obrigatório.",
      "string.pattern.base": "O CPF deve conter exatamente 11 dígitos numéricos.",
      "any.required": "O CPF é obrigatório."
    }),

  telefone: Joi.string().trim().pattern(/^\d{11}$/).required()
    .messages({
      "string.empty": "O telefone é obrigatório.",
      "string.pattern.base": "O telefone deve conter exatamente 11 dígitos numéricos (DDD + número).",
      "any.required": "O telefone é obrigatório."
    })
})

const atualizarPacienteSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100)
    .pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .messages({
      "string.min": "O nome deve ter no mínimo 5 caracteres.",
      "string.max": "O nome pode ter no máximo 100 caracteres.",
      "string.pattern.base": "O nome deve conter apenas letras e espaços."
    }),

  genero: Joi.string().valid("M", "F", "X")
    .messages({
      "any.only": "O gênero deve ser 'M', 'F' ou 'X'."
    }),

  email: Joi.string().trim()
    .pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/)
    .messages({
      "string.pattern.base": "O e-mail deve ser um Gmail válido."
    }),

  senha: Joi.string().trim().length(6)
    .messages({
      "string.length": "A senha deve ter exatamente 6 caracteres."
    }),

  cpf: Joi.string().trim().pattern(/^\d{11}$/)
    .messages({
      "string.pattern.base": "O CPF deve conter exatamente 11 dígitos."
    }),

  telefone: Joi.string().trim().pattern(/^\d{11}$/)
    .messages({
      "string.pattern.base": "O telefone deve conter exatamente 11 dígitos."
    })
}).min(1).messages({
  "object.min": "É necessário informar ao menos um campo para atualizar."
})


module.exports = {

  //  paciente cria sua própria conta
  async cadastrarPaciente(req, res) {
    try {
      const { error, value } = criarPacienteSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({ erros: error.details.map(d => d.message) });
      }

      const existeEmail =
        await Pacientes.findOne({ where: { email: value.email } }) ||
        await Usuarios.findOne({ where: { email: value.email } })||
        await Medicos.findOne({ where: { email: value.email } })


      if (existeEmail) return res.status(409).json({ msg: "E-mail já cadastrado." });

      const existeCpf = await Pacientes.findOne({ where: { cpf: value.cpf } });
      if (existeCpf) return res.status(409).json({ msg: "CPF já cadastrado." });

      const existeTel =
        await Pacientes.findOne({ where: { telefone: value.telefone } }) ||
        await Medicos.findOne({ where: { telefone: value.telefone } }) ||
        await Usuarios.findOne({ where: { telefone: value.telefone } });

      if (existeTel) return res.status(409).json({ msg: "Telefone já cadastrado." });

      const senhaHash = await bcrypt.hash(value.senha, 10);

      const paciente = await Pacientes.create({
        ...value,
        senha: senhaHash,
      });

      res.status(201).json({ msg: "Paciente criado com sucesso!", paciente });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Erro ao criar paciente." });
    }
  },

  //  admin + recepcao podem cadastrar pacientes
  async registrarPaciente(req, res) {
    const usuario = req.usuario;
    if (!usuario || !["admin", "recepcao"].includes(usuario.tipo)) {
      return res.status(401).json({ msg: "Apenas admin ou recepção podem registrar pacientes." });
    }

    try {
      const { error, value } = criarPacienteSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({ erros: error.details.map(d => d.message) });
      }

      const emailExistente =
        await Pacientes.findOne({ where: { email: value.email } }) ||
        await Usuarios.findOne({ where: { email: value.email } }) ||
        await Medicos.findOne({ where: { email: value.email } });

      if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });

      const cpfExistente = await Pacientes.findOne({ where: { cpf: value.cpf } });
      if (cpfExistente) return res.status(409).json({ msg: "CPF já cadastrado." });

      const telefoneExistente =
        await Pacientes.findOne({ where: { telefone: value.telefone } }) ||
        await Medicos.findOne({ where: { telefone: value.telefone } }) ||
        await Usuarios.findOne({ where: { telefone: value.telefone } });

      if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });

      const senhaHash = await bcrypt.hash(value.senha, 10);

      const paciente = await Pacientes.create({
        ...value,
        senha: senhaHash
      });

      res.status(201).json({ msg: "Paciente criado com sucesso!", paciente });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao criar paciente." });
    }
  },

  // SOMENTE ADMIN LISTA TODOS PACIENTES
  async listarPaciente(req, res) {
    try{
    const usuario = req.usuario;
    if (!usuario || usuario.tipo !== "admin") {
      return res.status(403).json({ msg: "Somente admins podem listar pacientes." });
    }

    const pacientes = await Pacientes.findAll();
    return res.json(pacientes);
  }catch(erro){
    console.error(erro);
    res.status(500).json({ msg: "Erro ao listar pacientes." });
  }
  },

  // ADM atualiza paciente
 async atualizarPaciente(req, res) {
  const usuario = req.usuario;

  if (!usuario || usuario.tipo !== "admin") {
    return res.status(401).json({ msg: "Somente admins podem atualizar pacientes." });
  }

  const { id } = req.params;

  try {
    const { error, value } = atualizarPacienteSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ erros: error.details.map(d => d.message) });
    }

    const paciente = await Pacientes.findByPk(id);
    if (!paciente) {
      return res.status(404).json({ msg: "Paciente não encontrado." });
    }

    if (value.email && value.email !== paciente.email) {
      const emailExistente =
        await Pacientes.findOne({ where: { email: value.email } }) ||
        await Usuarios.findOne({ where: { email: value.email } }) ||
        await Medicos.findOne({ where: { email: value.email } });

      if (emailExistente) {
        return res.status(409).json({ msg: "E-mail já está em uso." });
      }
    }

    if (value.cpf && value.cpf !== paciente.cpf) {
      const cpfExistente = await Pacientes.findOne({ where: { cpf: value.cpf } });
      if (cpfExistente) {
        return res.status(409).json({ msg: "CPF já cadastrado." });
      }
    }

    if (value.telefone && value.telefone !== paciente.telefone) {
      const telExistente =
        await Pacientes.findOne({ where: { telefone: value.telefone } }) ||
        await Medicos.findOne({ where: { telefone: value.telefone } }) ||
        await Usuarios.findOne({ where: { telefone: value.telefone } });

      if (telExistente) {
        return res.status(409).json({ msg: "Telefone já está em uso." });
      }
    }

    if (value.senha) {
      value.senha = await bcrypt.hash(value.senha, 10);
    }

    await Pacientes.update(value, { where: { id_paciente: id } });

    res.json({ msg: "Paciente atualizado com sucesso!" });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ msg: "Erro ao atualizar paciente." });
  }
}
,

  // adm ativa paciente
  async ativarPaciente(req, res) {
    const usuario = req.usuario;
    if (!usuario || usuario.tipo !== "admin") {
      return res.status(401).json({ msg: "Somente admins podem ativar pacientes." });
    }

    const { id } = req.params;

    try {
      const paciente = await Pacientes.findByPk(id);
      if (!paciente) return res.status(404).json({ msg: "Paciente não encontrado." });

      if (paciente.ativo === true) {
        return res.status(409).json({ msg: "Paciente já está ativado." });
      }

      await Pacientes.update({ ativo: true }, { where: { id_paciente: id } });

      res.json({ msg: "Paciente ativado." });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao ativar paciente." });
    }
  },

  //  ADM desativa paciente
  async desativarPaciente(req, res) {
    const usuario = req.usuario;
    if (!usuario || usuario.tipo !== "admin") {
      return res.status(401).json({ msg: "Somente admins podem desativar pacientes." });
    }

    const { id } = req.params;

    try {
      const paciente = await Pacientes.findByPk(id);
      if (!paciente) return res.status(404).json({ msg: "Paciente não encontrado." });

      if (paciente.ativo === false) {
        return res.status(409).json({ msg: "Paciente já está desativado." });
      }

      await Pacientes.update({ ativo: false }, { where: { id_paciente: id } });

      res.json({ msg: "Paciente desativado." });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao desativar paciente." });
    }
  }
};
