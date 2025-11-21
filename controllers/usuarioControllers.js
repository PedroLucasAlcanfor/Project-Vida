const Usuarios = require("../models/Usuarios");
const Pacientes = require("../models/Pacientes");
const Medicos = require("../models/Medico");
const Joi = require("joi"); 
const db = require("../config/database");
const bcrypt = require("bcrypt"); 
const { Op } = require("sequelize");


const criarUsuarioSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/).required()
    .messages({
      "string.empty": "O nome não pode ser vazio",
      "string.pattern.base": "O nome não deve possuir números ou caracteres especiais",
      "string.min": "O nome deve ter pelo menos 5 caracteres",
      "string.max": "O nome deve ter no máximo 100 caracteres"
    }),
  
  genero: Joi.string().trim().valid("masculino", "feminino", "outro").required()
    .messages({
      "string.empty": "O gênero não pode ser vazio",
      "any.required": "O gênero é obrigatório",
      "any.only": "Gênero deve ser masculino, feminino ou outro"
    }),

  email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/).required()
    .messages({
      "string.pattern.base": "Digite um e-mail válido",
      "any.required": "O e-mail é obrigatório"
    }),

  cpf: Joi.string().trim().pattern(/^\d{11}$/).required()
    .messages({
      "string.pattern.base": "O CPF deve conter 11 dígitos",
      "any.required": "O CPF é obrigatório"
    }),

  senha: Joi.string().trim().min(6).required()
    .messages({
      "string.min": "A senha deve ter no mínimo 6 caracteres",
      "string.empty": "A senha não pode ser vazia"
    }),

  tipo: Joi.string().trim().valid("admin", "recepcao").required()
    .messages({
      "string.empty": "O tipo não pode ser vazio",
      "any.required": "O tipo é obrigatório",
      "any.only": "O tipo deve ser admin ou recepcao"
    }),

  credencial: Joi.string().pattern(/^[0-9]{4}$/).required()
    .messages({
      "string.pattern.base": "Credencial inválida. Deve ter 4 dígitos."
    }),

  telefone: Joi.string().trim().pattern(/^\d{11}$/).required()
    .messages({
      "string.pattern.base": "O telefone deve conter 11 dígitos",
      "any.required": "O telefone é obrigatório"
    })
});

const atualizarUsuarioSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/)
    .messages({
      "string.empty": "O nome não pode ser vazio",
      "string.pattern.base": "O nome não deve possuir números ou caracteres especiais",
      "string.min": "O nome deve ter pelo menos 5 caracteres",
      "string.max": "O nome deve ter no máximo 100 caracteres"
    }),

  genero: Joi.string().trim()
    .valid("masculino", "feminino", "outro")
    .messages({
      "any.only": "Gênero deve ser masculino, feminino ou outro"
    }),

  email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/)
    .messages({
      "string.pattern.base": "Digite um e-mail válido"
    }),

  cpf: Joi.string().trim().pattern(/^\d{11}$/)
    .messages({
      "string.pattern.base": "O CPF deve conter 11 dígitos"
    }),

  senha: Joi.string().trim().min(6)
    .messages({
      "string.min": "A senha deve ter no mínimo 6 caracteres"
    }),

  credencial: Joi.string().pattern(/^[0-9]{4}$/)
    .messages({
      "string.pattern.base": "Credencial inválida. Deve ter 4 dígitos."
    }),

  tipo: Joi.string().trim().valid("admin", "recepcao")
    .messages({
      "any.only": "O tipo deve ser admin ou recepcao"
    }),

  telefone: Joi.string().trim().pattern(/^\d{11}$/)
    .messages({
      "string.pattern.base": "O telefone deve conter 11 dígitos"
    })
}).min(1);


module.exports = {

  async listarUsuarios(req, res) {
    const usuario = req.usuario;
    if (!usuario || usuario.tipo !== "admin") {
      return res.status(401).json({ msg: "Somente admins podem acessar essa rota" });
    }

    const usuarios = await Usuarios.findAll();
    res.json(usuarios);
  },

  async listarTodosCadastrados(req, res) {
    const [usuarios, medicos, pacientes] = await Promise.all([
      Usuarios.findAll(),
      Medicos.findAll(),
      Pacientes.findAll()
    ]);
    res.json({ usuarios, medicos, pacientes });
  },

  async criarUsuarios(req, res) {
    try {
      const { error, value } = criarUsuarioSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({ erros: error.details.map(d => d.message) });
      }

      const usuario = req.usuario;
      if (!usuario || usuario.tipo !== "admin") {
        return res.status(401).json({ msg: "Somente admins podem acessar essa rota" });
      }

      const emailExistente =
        await Usuarios.findOne({ where: { email: value.email } }) ||
        await Pacientes.findOne({ where: { email: value.email } }) ||
        await Medicos.findOne({ where: { email: value.email } });

      if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });

      const cpfExistente =
        await Usuarios.findOne({ where: { cpf: value.cpf } }) ||
        await Pacientes.findOne({ where: { cpf: value.cpf } }) ||
        await Medicos.findOne({ where: { cpf: value.cpf } });

      if (cpfExistente) return res.status(409).json({ msg: "CPF já cadastrado." });

      const telefoneExistente =
        await Pacientes.findOne({ where: { telefone: value.telefone } }) ||
        await Medicos.findOne({ where: { telefone: value.telefone } }) ||
        await Usuarios.findOne({ where: { telefone: value.telefone } });

      if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });

      const credencialExistente = await Usuarios.findOne({ where: { credencial: value.credencial } });
      if (credencialExistente) return res.status(409).json({ msg: "Credencial já cadastrada." });

      const senhaHash = await bcrypt.hash(value.senha, 10);

      const novoUsuario = await Usuarios.create({
        ...value,
        senha: senhaHash
      });

      res.status(201).json({ msg: "Usuário criado com sucesso!", usuario: novoUsuario });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao criar usuário." });
    }
  },

  async atualizarUsuarios(req, res) {
    const { id } = req.params;

    try {
      const { error, value } = atualizarUsuarioSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({ erros: error.details.map(d => d.message) });
      }

      const usuario = req.usuario;
      if (!usuario || usuario.tipo !== "admin") {
        return res.status(401).json({ msg: "Somente admins podem acessar essa rota" });
      }

      if (value.email) {
        const emailExistente =
          await Usuarios.findOne({
            where: { email: value.email, id_usuario: { [Op.ne]: id } }
          }) ||
          await Pacientes.findOne({ where: { email: value.email } }) ||
          await Medicos.findOne({ where: { email: value.email } });

        if (emailExistente) return res.status(409).json({ msg: "E-mail já existente." });
      }

      if (value.cpf) {
        const cpfOutrasTabelas =
          await Pacientes.findOne({ where: { cpf: value.cpf } }) ||
          await Medicos.findOne({ where: { cpf: value.cpf } });

        if (cpfOutrasTabelas) {
          return res.status(409).json({ msg: "CPF já cadastrado." });
        }

        const cpfExistente = await Usuarios.findOne({
          where: {
            cpf: value.cpf,
            id_usuario: { [Op.ne]: id }
          }
        });

        if (cpfExistente) {
          return res.status(409).json({ msg: "CPF já cadastrado." });
        }
      }


      if (value.senha) {
        value.senha = await bcrypt.hash(value.senha, 10);
      }

      if (value.credencial) {
        const credencialExistente = await Usuarios.findOne({
          where: { credencial: value.credencial, id_usuario: { [Op.ne]: id } }
        });
        if (credencialExistente) return res.status(409).json({ msg: "Credencial já existente." });
      }

      if (value.telefone) {
        const telefoneExistente =
          await Pacientes.findOne({ where: { telefone: value.telefone } }) ||
          await Medicos.findOne({ where: { telefone: value.telefone } }) ||
          await Usuarios.findOne({
            where: { telefone: value.telefone, id_usuario: { [Op.ne]: id } }
          });

        if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });
      }

      const [atualizado] = await Usuarios.update(value, { where: { id_usuario: id } });

      if (atualizado === 0) {
        return res.status(404).json({ msg: "Usuário não encontrado." });
      }

      res.json({ msg: "Usuário atualizado com sucesso!" });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao atualizar o usuário." });
    }
  },

  // DESATIVAR USUÁRIO
  async desativarUsuario(req, res) {
    const { id } = req.params;

    const usuario = req.usuario;
    if (!usuario || usuario.tipo !== "admin") {
      return res.status(401).json({ msg: "Somente admins podem acessar essa rota" });
    }

    try {
      const user = await Usuarios.findByPk(id);
      if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });
      if (!user.ativo) return res.status(409).json({ msg: "Usuário já está desativado." });

      await user.update({ ativo: false });
      res.json({ msg: "Usuário desativado com sucesso!" });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao desativar usuário." });
    }
  },

  // ATIVAR USUÁRIO
  async ativarUsuario(req, res) {
    const { id } = req.params;

    const usuario = req.usuario;
    if (!usuario || usuario.tipo !== "admin") {
      return res.status(401).json({ msg: "Somente admins podem acessar essa rota" });
    }

    try {
      const user = await Usuarios.findByPk(id);
      if (!user) return res.status(404).json({ msg: "Usuário não encontrado." });
      if (user.ativo) return res.status(409).json({ msg: "Usuário já está ativo." });

      await user.update({ ativo: true });
      res.json({ msg: "Usuário ativado com sucesso!" });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao ativar usuário." });
    }
  }
};
