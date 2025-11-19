//ADICIONAR O BCRYPT A CADA TIPO DE CRIAÇÃO DE USUARIO

const Pacientes = require("../models/Pacientes");
const Usuarios = require("../models/Usuarios");
const Medicos = require("../models/Medico")
const bcrypt = require("bcrypt");
const Joi = require("joi");
const db = require("../config/database");

const criarPacienteSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/).required()
    .messages({
      "string.empty": "O nome não pode ser vazio",
      "string.pattern.base": "O nome não deve possuir números ou caracteres especiais",
      "string.min": "O nome deve ter pelo menos 5 caracteres",
      "string.max": "O nome deve ter no máximo 100 caracteres",
      "any.required": "O nome é obrigatório"
    }),
  genero: Joi.string().trim().valid('M', 'F', 'X').required()
    .messages({ 
      "string.empty": "O gênero não pode ser vazio",
      "any.required": "O gênero é obrigatório",
      "any.only": "Gênero deve ser masculino, feminino ou outro."
    }),
  email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/).required()
    .messages({
      "string.pattern.base": "Digite um e-mail válido",
      "any.required": "O e-mail é obrigatório",
    }),
  senha: Joi.string().trim().length(6).required()
    .messages({
      "string.length": "A senha deve ter exatamente 6 caracteres",
      "string.empty": "A senha não pode ser vazia",
      "any.required": "A senha é obrigatória"
    }),
  cpf: Joi.string().trim().required().pattern(/^\d{11}$/)
    .messages({
      "string.pattern.base": "O cpf deve conter 11 dígitos",
      "any.required": "O cpf é obrigatório"
    }),
  telefone: Joi.string().trim().required().pattern(/^\d{11}$/)
    .messages({
      "string.pattern.base": "O número deve conter 11 dígitos",
      "any.required": "O número é obrigatório"
    }),
    
});

const atualizarPacienteSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/),
  genero: Joi.string().trim().valid('M', 'F', 'X'),
  email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/),
  senha: Joi.string().trim().min(6).max(100),
  cpf: Joi.string().trim().pattern(/^\d{11}$/),
  telefone: Joi.string().trim().pattern(/^\d{11}$/),
}).min(1);

module.exports = {
  async listarPaciente(req, res) {
    const usuarios = await Pacientes.findAll();
    res.json(usuarios);
  },

  //Paciente se cadastra
  async cadastrarPaciente(req, res) {
    try {
    console.log("Dados recebidos: ", req.body)
      const { error, value } = criarPacienteSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const mensagens = error.details.map(d => d.message);
        return res.status(400).json({ erros: mensagens });
      }

    const emailExistente = await Pacientes.findOne({ where: { email: value.email } }) || await Usuarios.findOne({ where: { email: value.email } });
    if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });

    const nomeExistente = await Pacientes.findOne({ where: { nome: value.nome } }) 
    if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

    const cpfExistente = await Pacientes.findOne({ where: { cpf: value.cpf } });
    if (cpfExistente) return res.status(409).json({ msg: "CPF já cadastrado." });

    const telefoneExistente = await Pacientes.findOne({ where: { telefone: value.telefone } }) || await Medicos.findOne({ where: { telefone: value.telefone } }) ||  await Usuarios.findOne({ where: { telefone: value.telefone } }) 
    if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });

    const senhaHash = await bcrypt.hash(value.senha, 10);

    const paciente = await Pacientes.create({
      ...value,
      senha:senhaHash
    });

    res.status(201).json({ msg: "Paciente criado com sucesso!", paciente });
console.log("Paciente salvo:", paciente);    
} catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao criar paciente." });
    }
  },
  //ADM cadastra paciente
 async registrarPaciente(req, res) {
  try {
    const { error, value } = criarPacienteSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const mensagens = error.details.map(d => d.message);
      return res.status(400).json({ erros: mensagens });
    }

    const emailExistente = await Pacientes.findOne({ where: { email: value.email } }) || await Usuarios.findOne({ where: { email: value.email } }) || await Medicos.findOne({ where: { email: value.email } });
    if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });

    const nomeExistente = await Pacientes.findOne({ where: { nome: value.nome } })
    if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

    const cpfExistente = await Pacientes.findOne({ where: { cpf: value.cpf } });
    if (cpfExistente) return res.status(409).json({ msg: "CPF já cadastrado." });

    const telefoneExistente = await Pacientes.findOne({ where: { telefone: value.telefone } }) || await Medicos.findOne({ where: { telefone: value.telefone } }) ||  await Usuarios.findOne({ where: { telefone: value.telefone } }) 
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

  async atualizarPaciente(req, res) {
    const { id } = req.params;
    try {
      const { error, value } = atualizarPacienteSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const mensagens = error.details.map(d => d.message);
        return res.status(400).json({ erros: mensagens });
      }

      if(value.senha){
        const senhaHash = await bcrypt.hash(value.senha, 10)
        value.senha = senhaHash
      }
      
      if (value.nome) {
        const nomeExistente = await Pacientes.findOne({
          where: { nome: value.nome, id_paciente: { [db.Sequelize.Op.ne]: id } }
        }) || await Usuarios.findOne({ where: { nome: value.nome } }) 
        ||  await Medicos.findOne({ where: { nome: value.nome } }) 

        if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });
      }

      if (value.email) {
        const emailExistente = await Pacientes.findOne({
          where: { email: value.email, id_paciente: { [db.Sequelize.Op.ne]: id } }
        }) || await Usuarios.findOne({ where: { email: value.email } }) 
            ||  await Medicos.findOne({ where: { nome: value.nome } }) 
        if (emailExistente) return res.status(409).json({ msg: "E-mail já existente." });
      }

      if (value.cpf) {
        const cpfExistente = await Pacientes.findOne({
          where: { cpf: value.cpf, id_paciente: { [db.Sequelize.Op.ne]: id } }
        });
        if (cpfExistente) return res.status(409).json({ msg: "CPF já cadastrado." });
      }

      if (value.telefone) {
        const telefoneExistente = await Pacientes.findOne({
          where: { telefone: value.telefone, id_paciente: { [db.Sequelize.Op.ne]: id } }
        }) ||  await Medicos.findOne({
          where: { telefone: value.telefone}
        }) 
        if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });
      }

      const [atualizados] = await Pacientes.update(value, { where: { id_paciente: id } });
      if (atualizados === 0) return res.status(404).json({ msg: "Usuário não encontrado." });

      res.json({ msg: "Usuário atualizado com sucesso!" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao atualizar paciente." });
    }
  },

  async ativarPaciente(req, res) {
    const { id } = req.params;
    try {
      const paciente = await Pacientes.findByPk(id);
      if (!paciente) return res.status(404).json({ msg: "Paciente não encontrado" });
      if (paciente.ativo === true) return res.status(409).json({ msg: "Paciente já está ativado" });
      await Pacientes.update({ ativo: true }, { where: { id_paciente: id } });
      res.json({ msg: "Paciente ativado" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao atualizar" });
    }
  },

  async desativarPaciente(req, res) {
    const { id } = req.params;
    try {
      const paciente = await Pacientes.findByPk(id);
      if (!paciente) return res.status(404).json({ msg: "Paciente não encontrado" });
      if (paciente.ativo === false) return res.status(409).json({ msg: "Paciente já está desativado" });
      await Pacientes.update({ ativo: false }, { where: { id_paciente: id } });
      res.json({ msg: "Paciente desativado" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao atualizar" });
    }
  }
};
