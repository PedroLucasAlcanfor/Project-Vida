const Medicos = require("../models/Medico")
const Joi = require("joi")
const db = require("../config/database");
const Pacientes = require("../models/Pacientes");
const Usuarios = require("../models/Usuarios");
const bcrypt = require("bcrypt")
const { Op } = require("sequelize");


const criarMedicoSchema = Joi.object({
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
    crm: Joi.string().trim().pattern(/^\d{1,6}[A-Z]{2}$/).required()
    .messages({
        "string.pattern.base" : "Digite um crm válido => 6 numeros e 2 letras maiúsculas",
        "string.empty":"O CRM não pode ser vazio",
        "any.required": "O CRM é obrigatório"
    }),
    telefone: Joi.string().trim().required().pattern(/^\d{11}$/)
    .messages({
      "string.pattern.base": "O número deve conter 11 dígitos",
      "any.required": "O número é obrigatório"
    }),
    especialidade: Joi.string().trim().valid('Cardiologista', 'Neurologista', 'Ortopedista', 'Emergencista', 'Psicólogo', 'Pneumologista', 'Urologista', 'Ginecologista').required()
    .messages({
      "string.empty": "A especialidade não pode ser vazia",
      "any.required": "A especialidade é obrigatória",
      "any.only": "Especialidade deve ser Cardiologista, Neurologista, Ortopedista, Emergencista, Psicólogo, Pneumologista, Urologista, Ginecologista"
    })})
 const atualizarMedicoSchema = Joi.object({
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
    crm: Joi.string().trim().pattern(/^\d{1,6}-[A-Z]{2}$/).required()
    .messages({
        "string.pattern.base" : "Digite um crm válido",
        "string.empty":"O CRM não pode ser vazio",
        "any.required": "O CRM é obrigatório"
    }),
    telefone: Joi.string().trim().required().pattern(/^\d{11}$/).optional()
    .messages({
      "string.pattern.base": "O número deve conter 11 dígitos",
      "any.required": "O número é obrigatório"
    }),
    especialidade: Joi.string().trim().valid('Cardiologista, Neurologista, Ortopedista, Oftamologista, Psicólogo, Pneumologista, Urologista, Ginecologista').required()
    .messages({
      "string.empty": "A especialidade não pode ser vazia",
      "any.required": "A especialidade é obrigatória",
      "any.only": "Especialidade deve ser Cardiologista, Neurologista, Ortopedista, Oftamologista, Psicólogo, Pneumologista, Urologista, Ginecologista"
  })
}).min(1)

module.exports = {
    async listarMedicos(req,res){
        const medicos = await Medicos.findAll();
        res.json(medicos)
    },

    async criarMedico(req, res){
        try{
            const { error, value } = criarMedicoSchema.validate(req.body, { abortEarly: false });
            if (error) {
                const mensagens = error.details.map(d => d.message);
                return res.status(400).json({ erros: mensagens });
            }
    const emailExistente = await Pacientes.findOne({ where: { email: value.email } }) || await Usuarios.findOne({ where: { email: value.email } }) || await Medicos.findOne({ where: { email: value.email } });
    if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });

    const nomeExistente = await Pacientes.findOne({ where: { nome: value.nome } }) || await Usuarios.findOne({ where: { nome: value.nome } }) || await Medicos.findOne({ where: { nome: value.nome } });
    if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

    const telefoneExistente = await Pacientes.findOne({ where: { telefone: value.telefone } }) || await Usuarios.findOne({ where: { telefone: value.telefone } }) || await Medicos.findOne({ where: { telefone: value.telefone } });
    if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });

    const crmExistente = await Medicos.findOne({where: {crm: value.crm}})
    if(crmExistente) return res.status(409).json({mgs:"Crm já cadastrada"})

    const senhaHash = await bcrypt.hash(value.senha, 10)

    const medico = await Medicos.create({
        ...value,
        senha: senhaHash
    });

      res.status(201).json({ msg: "Médico criado com sucesso!",medico});
        }catch(erro){
            console.error(erro);
            res.status(500).json({ msg: "Erro ao criar médico." });
        }
    },
    
    async atualizarMedicos(req,res){
        const { id } = req.params;
        try {
            const { error, value } = atualizarMedicoSchema.validate(req.body, { abortEarly: false });
            if (error) {
                const mensagens = error.details.map(d => d.message);
                return res.status(400).json({ erros: mensagens });
            }

            if (value.nome) {
                const nomeExistente = await Medicos.findOne({
                where: { nome: value.nome, id_medico: { [db.Sequelize.Op.ne]: id } }
                }) || await Usuarios.findOne({ where: { nome: value.nome } }) 
                ||  await Pacientes.findOne({ where: { nome: value.nome } }) 

                if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });
            }

            if (value.email) {
                const emailExistente = await Medicos.findOne({
                where: { email: value.email, id_medico: { [db.Sequelize.Op.ne]: id } }
                }) || await Pacientes.findOne({ where: { email: value.email } }) 
                    ||  await Usuarios.findOne({ where: { nome: value.nome } }) 
                if (emailExistente) return res.status(409).json({ msg: "E-mail já existente." });
            }

            if(value.crm){
                const crmExistente = await Medicos.findOne({
                where: {credencial: value.crm, id_medico: {[db.Sequelize.Op.ne]: id}}
                })
                if(crmExistente) return res.status(409).json({msg: "Credencial já existente"})

            }
            
            if(value.senha){
                const senhaHash = bcrypt.hash(value.senha, 10)
                value.senha = senhaHash
            }

            if (value.telefone) {
                const telefoneExistente = await Pacientes.findOne({
                where: { telefone: value.telefone }
                }) ||  await Usuarios.findOne({
                where: { telefone: value.telefone }
                }) ||  await Medicos.findOne({
                where: { telefone: value.telefone, id_medico: { [db.Sequelize.Op.ne]: id } }
                }) 
                if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });
            }

            const [atualizados] = await Medicos.update(value, { where: { id_medico: id } });
            if (atualizados === 0) return res.status(404).json({ msg: "Usuário não encontrado." });

            res.json({ msg: "Médico atualizado com sucesso!" });
        }catch (erro) {
            console.error(erro);
            res.status(500).json({ msg: "Erro ao atualizar o médico." });
        }                                                                               
  },
  async desativarMedicos(req, res) {
    const { id } = req.params;
    try {
      const medico = await Medicos.findByPk(id);
      if (!medico) return res.status(404).json({ msg: "Médico não encontrado." });
      if (!medico.ativo) return res.status(409).json({ msg: "Médico já está desativado." });

      await medico.update({ ativo: false });
      res.json({ msg: "Médico desativado com sucesso!" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao desativar médico." });
    }
  },

  async ativarMedicos(req, res) {
    const { id } = req.params;
    try {
      const medico = await Medicos.findByPk(id);
      if (!medico) return res.status(404).json({ msg: "Médico não encontrado." });
      if (medico.ativo) return res.status(409).json({ msg: "Médico já está ativo." });

      await Medicos.update({ ativo: true });
      res.json({ msg: "Médico ativado com sucesso!" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao ativar médico." });
    }
  }
}
