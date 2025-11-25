const Joi = require("joi");
const Prontuarios = require("../models/Prontuarios");
const Pacientes = require("../models/Pacientes");

const criarProntuarioSchema = Joi.object({
    cpf: Joi.string().pattern(/^\d{11}$/).required().messages({
        "any.required": "O CPF do paciente é obrigatório."
    }),
    alergias: Joi.string().trim().allow("", null),
    doencas_cronicas: Joi.string().trim().allow("", null),
    medicamentos_continuos: Joi.string().trim().allow("", null),
    observacoes_gerais: Joi.string().trim().allow("", null), // texto normal
});

const atualizarProntuarioSchema = Joi.object({
    alergias: Joi.string().trim().allow("", null),
    doencas_cronicas: Joi.string().trim().allow("", null),
    medicamentos_continuos: Joi.string().trim().allow("", null),
    observacoes_gerais: Joi.string().trim().allow("", null), // texto normal
});
const buscarProntuarioSchema = Joi.object({
    cpf: Joi.string().pattern(/^\d{11}$/).required()
        .messages({
            "string.pattern.base": "CPF inválido. Use apenas números (11 dígitos).",
            "any.required": "O CPF é obrigatório."
        })
});

const toArray = (v) =>
    !v ? [] : v.split(",").map(i => i.trim()).filter(i => i.length > 0);

module.exports = {

    async listarProntuarioInd(req, res) {
        try {
            const usuario = req.usuario;

            if (usuario.tipo !== "paciente" && usuario.tipo !== "admin")
                return res.status(403).json({ msg: "Acesso negado." });

            const prontuario = await Prontuarios.findOne({
                where: { id_paciente: usuario.id }
            });

            if (!prontuario)
                return res.status(404).json({ msg: "Nenhum prontuário encontrado." });

            return res.json(prontuario);

        } catch (erro) {
            console.error("Erro ao listar prontuário:", erro);
            return res.status(500).json({ msg: "Erro interno no servidor." });
        }
    },

    async listarProntuarios(req, res) {
        try {
            const usuario = req.usuario;

            if (!usuario || usuario.tipo !== "admin")
                return res.status(401).json({ msg: "Somente admins podem acessar essa rota." });

            const prontuarios = await Prontuarios.findAll();
            return res.json(prontuarios);

        } catch (erro) {
            console.error("Erro ao listar prontuários:", erro);
            return res.status(500).json({ msg: "Erro interno no servidor." });
        }
    },
    
    async procurarProntuario(req, res) {
        try {
            const usuario = req.usuario;

            if (usuario.tipo !== "medico" && usuario.tipo !== "admin") {
                return res.status(403).json({ msg: "Acesso negado." });
            }

            const { error, value } = buscarProntuarioSchema.validate(req.body, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    erros: error.details.map(d => d.message)
                });
            }

            const { cpf } = value;

            const paciente = await Pacientes.findOne({
                where: { cpf }
            });

            if (!paciente) {
                return res.status(404).json({ msg: "Paciente não encontrado com esse CPF." });
            }

            const prontuario = await Prontuarios.findOne({
              where: { id_paciente: paciente.id_paciente }
            });

            if (!prontuario) {
                return res.status(404).json({ msg: "Este paciente ainda não possui prontuário." });
            }

            return res.json({
                msg: "Prontuário encontrado!",
                paciente: {
                    id: paciente.id,
                    nome: paciente.nome,
                    cpf: paciente.cpf
                },
                prontuario
            });

        } catch (erro) {
            console.error("Erro ao procurar prontuário:", erro);
            return res.status(500).json({ msg: "Erro interno no servidor." });
        }
    },

    async criarProntuario(req, res) {
        try {
            const usuario = req.usuario;

            if (usuario.tipo !== "medico" && usuario.tipo !== "admin")
                return res.status(401).json({ msg: "Somente médicos e adms podem criar prontuários." });

            const { error, value } = criarProntuarioSchema.validate(req.body, { abortEarly: false });

            if (error) {
                return res.status(400).json({ erros: error.details.map(d => d.message) });
            }

            const paciente = await Pacientes.findOne({
                where: { cpf: value.cpf }
            });

            if (!paciente)
                return res.status(404).json({ msg: "Paciente não encontrado pelo CPF informado." });

            const existente = await Prontuarios.findOne({
                where: { id_paciente: paciente.id }
            });

            if (existente)
                return res.status(409).json({ msg: "Este paciente já possui um prontuário." });

            const prontuario = await Prontuarios.create({
                id_paciente: paciente.id,
                alergias: toArray(value.alergias),
                doencas_cronicas: toArray(value.doencas_cronicas),
                medicamentos_continuos: toArray(value.medicamentos_continuos),
                observacoes_gerais: value.observacoes_gerais || "", 
                status: "ativo",
                atualizado_por: null,
                valores_antigos: []
            });

            return res.status(201).json({
                msg: "Prontuário criado com sucesso!",
                prontuario
            });

        } catch (erro) {
            console.error("Erro ao criar prontuário:", erro);
            return res.status(500).json({ msg: "Erro interno no servidor." });
        }
    },

    async atualizarProntuario(req, res) {
        try {
            const usuario = req.usuario;
            const idProntuario = req.params.id;

            if (usuario.tipo !== "medico" && usuario.tipo !== "admin")
            return res.status(403).json({ msg: "Acesso negado." });

            const { error, value } = atualizarProntuarioSchema.validate(
            req.body,
            { abortEarly: false }
            );

            if (error) {
            return res.status(400).json({ erros: error.details.map(d => d.message) });
            }

            const prontuario = await Prontuarios.findByPk(idProntuario);

            if (!prontuario)
            return res.status(404).json({ msg: "Prontuário não encontrado." });

            const antigo = {
            alergias: prontuario.alergias || [],
            doencas_cronicas: prontuario.doencas_cronicas || [],
            medicamentos_continuos: prontuario.medicamentos_continuos || [],
            observacoes_gerais: prontuario.observacoes_gerais || ""
            };

            const novo = {
            alergias: toArray(value.alergias),
            doencas_cronicas: toArray(value.doencas_cronicas),
            medicamentos_continuos: toArray(value.medicamentos_continuos),
            observacoes_gerais: value.observacoes_gerais || ""
            };

            const nadaMudou = JSON.stringify(antigo) === JSON.stringify(novo);

            if (nadaMudou) {
            return res.status(400).json({ msg: "Nenhuma alteração realizada." });
            }

            await prontuario.update({
            ...novo,
            atualizado_por: usuario.id,
            valores_antigos: [
                ...(prontuario.valores_antigos || []),
                {
                ...antigo,
                alterado_por: usuario.nome,
                data: new Date()
                }
            ]
            });

            return res.json({
            msg: "Prontuário atualizado com sucesso!",
            prontuario
            });

        } catch (erro) {
            console.error("Erro ao atualizar prontuário:", erro);
            return res.status(500).json({ msg: "Erro interno no servidor." });
        }
    }

}
