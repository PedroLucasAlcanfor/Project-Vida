const Usuarios = require("../models/Usuarios");
const Joi = require("joi");
const db = require("../config/database")

// Validação
const criarUsuarioSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/).required()
    .messages({
      "string.empty": "O nome não pode ser vazio",
      "string.pattern.base": "O nome não deve possuir números ou caracteres especiais",
      "string.min": "O nome deve ter pelo menos 5 caracteres",
      "string.max": "O nome deve ter no máximo 100 caracteres",
    }),
  genero: Joi.string().trim().required()
    .messages({ "string.empty": "O gênero não pode ser vazio" }),
  email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/).required()
    .messages({
      "string.pattern.base": "Digite um e-mail válido",
      "any.required": "O e-mail é obrigatório",
    }),
  senha: Joi.string().trim().length(6).required()
    .messages({
      "string.length": "A senha deve ter no mínimo 6 caracteres",
      "string.empty": "A senha não pode ser vazia",
      
    }),
  cargo: Joi.string().trim().required()
    .messages({ "string.empty": "O cargo não pode ser vazio" }),
  credencial: Joi.string().pattern(/^[0-9]{4}$/).optional()
    .messages({ "string.pattern.base": "Credencial inválida. Deve ter 4 dígitos." }),
});

const atualizarUsuarioSchema = Joi.object({
  nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/),
  genero: Joi.string().trim(),
  email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/),
  senha: Joi.string().trim().min(6).max(100),
  cargo: Joi.string().trim(),
}).min(1); 

module.exports = {

  // Lista todos os usuários (ADM)
  async listarUsuarios(req, res) {
    const usuarios = await Usuarios.findAll();
    res.json(usuarios);
  },

  // ADM cria ADM ou Recepcionista
  async criarUsuarios(req, res) {
    try {
      const { error, value } = criarUsuarioSchema.validate(req.body, { abortEarly: false });
      if (error) {
        const mensagens = error.details.map(d => d.message);
        return res.status(400).json({ erros: mensagens });
      }

      const emailExistente = await Usuarios.findOne({ where: { email: value.email } });
      const nomeExistente = await Usuarios.findOne({ where: { nome: value.nome } });

      if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });
      if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

      const usuario = await Usuarios.create(value);
      res.status(201).json({ msg: "Paciente criado com sucesso!", usuario });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao criar usuário." });
    }
  },

  // ADM atualiza ADM ou Recepcionista
  async atualizarUsuarios(req, res) {
  const { id } = req.params;

  try {
    const { error, value } = atualizarUsuarioSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const mensagens = error.details.map(d => d.message);
      return res.status(400).json({ erros: mensagens });
    }

    if(value.nome){
      const nomeExistente = await Usuarios.findOne({
      where: {
        nome: value.nome,
        id_usuario: { [db.Sequelize.Op.ne]: id } 
      }
    })
    if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

    }
    if(value.email){
      const nomeExistente = await Usuarios.findOne({
      where: {
        email: value.email,
        id_usuario: { [db.Sequelize.Op.ne]: id } 
      }
    });

    if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });
    }

    const [atualizados] = await Usuarios.update(value, { where: { id_usuario: id } });

    if (atualizados === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    res.json({ msg: "Usuário atualizado com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ msg: "Erro ao atualizar o usuário." });
  }
},

  // ADM desativa outro ADM ou Recepcionista
  async desativarUsuario(req, res) {
    const { id } = req.params;
    try {
      const [atualizados] = await Usuarios.update(
        { ativo: false },
        { where: { id_usuario: id } }
      );

      if (atualizados === 0) return res.status(404).json({ msg: "Usuário não encontrado" });

      res.json({ msg: "Usuário desativado" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao atualizar" });
    }
  },

  // ADM ativa ADM ou Recepcionista
  async ativarUsuario(req, res) {
    const { id } = req.params;
    try {
      const [atualizados] = await Usuarios.update(
        { ativo: true },
        { where: { id_usuario: id } }
      );

      if (atualizados === 0) return res.status(404).json({ msg: "Usuário não encontrado" });

      res.json({ msg: "Usuário ativado" });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ msg: "Erro ao atualizar" });
    }
  }
};
