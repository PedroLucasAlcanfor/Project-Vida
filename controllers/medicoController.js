const Medicos = require("../models/Medico");
const Joi = require("joi");
const db = require("../config/database");
const Pacientes = require("../models/Pacientes");
const Usuarios = require("../models/Usuarios");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// ---------------- SCHEMAS JOI ----------------

const criarMedicoSchema = Joi.object({
    nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/).required(),
    genero: Joi.string().valid("M", "F", "X").required(),
    email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/).required(),
    cpf: Joi.string().trim().pattern(/^\d{11}$/).required(),
    senha: Joi.string().trim().length(6).required(),
    crm: Joi.string().trim().pattern(/^\d{1,6}[A-Z]{2}$/).required(),
    telefone: Joi.string().trim().pattern(/^\d{11}$/).required(),
    especialidade: Joi.string().valid(
        "Cardiologista",
        "Neurologista",
        "Ortopedista",
        "Emergencista",
        "Psicólogo",
        "Pneumologista",
        "Urologista",
        "Ginecologista"
    ).required()
});

const atualizarMedicoSchema = Joi.object({
    nome: Joi.string().trim().min(5).max(100).pattern(/^[A-Za-zÀ-ÿ\s]+$/),
    genero: Joi.string().valid("M", "F", "X"),
    email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]{1,64}@gmail\.com$/),
    cpf: Joi.string().trim().pattern(/^\d{11}$/),
    senha: Joi.string().trim().length(6),
    crm: Joi.string().trim().pattern(/^\d{1,6}[A-Z]{2}$/), // agora igual ao criar
    telefone: Joi.string().trim().pattern(/^\d{11}$/),
    especialidade: Joi.string().valid(
        "Cardiologista",
        "Neurologista",
        "Ortopedista",
        "Emergencista",
        "Psicólogo",
        "Pneumologista",
        "Urologista",
        "Ginecologista"
    )
}).min(1);

// ---------------- CONTROLLER ----------------

module.exports = {

    async listarMedicos(req, res) {
        if (!req.usuario || req.usuario.tipo !== "admin") {
            return res.status(401).json({ msg: "Apenas administradores podem acessar esta rota." });
        }

        const medicos = await Medicos.findAll();
        res.json(medicos);
    },

    async criarMedico(req, res) {
        try {
            const { error, value } = criarMedicoSchema.validate(req.body, { abortEarly: false });
            if (error) {
                return res.status(400).json({ erros: error.details.map(d => d.message) });
            }

            if (!req.usuario || req.usuario.tipo !== "admin") {
                return res.status(401).json({ msg: "Apenas administradores podem acessar esta rota." });
            }

            // --- validações de duplicidade --- //

            const emailExistente = await Usuarios.findOne({ where: { email: value.email } }) ||
                                   await Pacientes.findOne({ where: { email: value.email } }) ||
                                   await Medicos.findOne({ where: { email: value.email } });

            if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });

            const nomeExistente = await Medicos.findOne({ where: { nome: value.nome } });
            if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

            const telefoneExistente =
                await Usuarios.findOne({ where: { telefone: value.telefone } }) ||
                await Pacientes.findOne({ where: { telefone: value.telefone } }) ||
                await Medicos.findOne({ where: { telefone: value.telefone } });

            if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });

            const cpfExistente = await Medicos.findOne({ where: { cpf: value.cpf } });
            if (cpfExistente) return res.status(409).json({ msg: "CPF já cadastrado." });

            const crmExistente = await Medicos.findOne({ where: { crm: value.crm } });
            if (crmExistente) return res.status(409).json({ msg: "CRM já cadastrado." });

            value.senha = await bcrypt.hash(value.senha, 10);

            const medico = await Medicos.create(value);

            res.status(201).json({ msg: "Médico criado com sucesso!", medico });

        } catch (erro) {
            console.error(erro);
            res.status(500).json({ msg: "Erro ao criar médico." });
        }
    },

    // ADM atualiza médico
    async atualizarMedicos(req, res) {
        const { id } = req.params;

        try {
            const { error, value } = atualizarMedicoSchema.validate(req.body, { abortEarly: false });
            if (error) {
                return res.status(400).json({ erros: error.details.map(d => d.message) });
            }

            if (!req.usuario || req.usuario.tipo !== "admin") {
                return res.status(401).json({ msg: "Apenas administradores podem acessar esta rota." });
            }


            if (value.nome) {
                const nomeExistente = await Medicos.findOne({
                    where: {
                        nome: value.nome,
                        id_medico: { [Op.ne]: id }
                    }
                });
                if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });
            }

            if (value.email) {
                const emailExistente =
                    await Usuarios.findOne({ where: { email: value.email } }) ||
                    await Pacientes.findOne({ where: { email: value.email } }) ||
                    await Medicos.findOne({
                        where: { email: value.email, id_medico: { [Op.ne]: id } }
                    });

                if (emailExistente) return res.status(409).json({ msg: "E-mail já existente." });
            }

            if (value.telefone) {
                const telefoneExistente =
                    await Usuarios.findOne({ where: { telefone: value.telefone } }) ||
                    await Pacientes.findOne({ where: { telefone: value.telefone } }) ||
                    await Medicos.findOne({
                        where: { telefone: value.telefone, id_medico: { [Op.ne]: id } }
                    });

                if (telefoneExistente) return res.status(409).json({ msg: "Telefone já cadastrado." });
            }

            if (value.cpf) {
                const cpfExistente =
                    await Usuarios.findOne({ where: { cpf: value.cpf } }) ||
                    await Pacientes.findOne({ where: { cpf: value.cpf } }) ||
                    await Medicos.findOne({
                        where: { cpf: value.cpf, id_medico: { [Op.ne]: id } }
                    });

                if (cpfExistente) return res.status(409).json({ msg: "CPF já cadastrado." });
            }

            if (value.crm) {
                const crmExistente = await Medicos.findOne({
                    where: { crm: value.crm, id_medico: { [Op.ne]: id } }
                });

                if (crmExistente) return res.status(409).json({ msg: "CRM já cadastrada." });
            }

            if (value.senha) {
                value.senha = await bcrypt.hash(value.senha, 10);
            }

            const [alterado] = await Medicos.update(value, {
                where: { id_medico: id }
            });

            if (!alterado) return res.status(404).json({ msg: "Médico não encontrado." });

            res.json({ msg: "Médico atualizado com sucesso!" });

        } catch (erro) {
            console.error(erro);
            res.status(500).json({ msg: "Erro ao atualizar médico." });
        }
    },

    //ADM desativa medico
    async desativarMedicos(req, res) {
        const { id } = req.params;

        try {
            if (!req.usuario || req.usuario.tipo !== "admin") {
                return res.status(401).json({ msg: "Apenas administradores podem acessar esta rota." });
            }

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

    //ADM ativa medico
    async ativarMedicos(req, res) {
        const { id } = req.params;

        try {
            if (!req.usuario || req.usuario.tipo !== "admin") {
                return res.status(401).json({ msg: "Apenas administradores podem acessar esta rota." });
            }

            const medico = await Medicos.findByPk(id);
            if (!medico) return res.status(404).json({ msg: "Médico não encontrado." });
            if (medico.ativo) return res.status(409).json({ msg: "Médico já está ativo." });

            await medico.update({ ativo: true });

            res.json({ msg: "Médico ativado com sucesso!" });

        } catch (erro) {
            console.error(erro);
            res.status(500).json({ msg: "Erro ao ativar médico." });
        }
    }

};
