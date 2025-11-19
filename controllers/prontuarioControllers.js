const Joi = require("joi");
const Prontuarios = require("../models/Prontuarios");
const Pacientes = require("../models/Pacientes");
const Medicos = require("../models/Medico");

const prontuarioSchema = Joi.object({
    cpf: Joi.string().pattern(/^\d{11}$/).required().messages({
        "any.required": "O CPF do paciente é obrigatório."
    }),
    alergias: Joi.string().trim().allow("", null),
    doencas_cronicas: Joi.string().trim().allow("", null),
    medicamentos_continuos: Joi.string().trim().allow("", null),
    observacoes_gerais: Joi.string().trim().allow("", null),
});

const toArray = (v) =>
    !v ? [] : v.split(",").map(i => i.trim()).filter(i => i.length > 0);

module.exports = {

    async listarProntuarioInd(req, res) {
        const usuario = req.usuario;

        if (usuario.tipo !== "paciente")
            return res.status(403).json({ msg: "Acesso negado." });

        const prontuario = await Prontuarios.findOne({ where: { id_paciente: usuario.id } });

        if (!prontuario)
            return res.status(404).json({ msg: "Nenhum prontuário encontrado." });

        return res.json(prontuario);
    },

    async listarProntuarios(req, res) {
        const prontuarios = await Prontuarios.findAll();
        res.json(prontuarios);
    },

    async criarProntuario(req, res) {
        try {
            const { error, value } = prontuarioSchema.validate(req.body);

            if (error) return res.status(400).json({
                erros: error.details.map(d => d.message)
            });

            const paciente = await Pacientes.findOne({
                where: { cpf: value.cpf }
            });

            if (!paciente)
                return res.status(404).json({ msg: "Paciente não encontrado pelo CPF informado." });

            const existente = await Prontuarios.findOne({
                where: { id_paciente: paciente.id_paciente }
            });

            if (existente)
                return res.status(409).json({ msg: "Paciente já possui prontuário." });

            const prontuario = await Prontuarios.create({
                id_paciente: paciente.id_paciente,
                alergias: toArray(value.alergias),
                doencas_cronicas: toArray(value.doencas_cronicas),
                medicamentos_continuos: toArray(value.medicamentos_continuos),
                observacoes_gerais: toArray(value.observacoes_gerais),
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

        if (usuario.tipo !== "medico" && usuario.tipo !== "admin")
            return res.status(403).json({ msg: "Acesso negado." });

        const { cpf } = req.body;

        if (!cpf)
            return res.status(400).json({ msg: "O CPF do paciente é obrigatório." });

        const { error, value } = prontuarioSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                erros: error.details.map(d => d.message)
            });
        }

        const paciente = await Pacientes.findOne({
            where: { cpf: value.cpf }
        });

        if (!paciente)
            return res.status(404).json({ msg: "Paciente não encontrado pelo CPF informado." });

        const prontuario = await Prontuarios.findOne({
            where: { id_paciente: paciente.id_paciente }
        });

        if (!prontuario)
            return res.status(404).json({ msg: "Prontuário não encontrado para este paciente." });

        const valoresAntigos = {
            alergias: prontuario.alergias,
            doencas_cronicas: prontuario.doencas_cronicas,
            medicamentos_continuos: prontuario.medicamentos_continuos,
            observacoes_gerais: prontuario.observacoes_gerais
            
        };
        const nadaMudou = 
            toArray(value.alergias).toString() === prontuario.alergias.toString() &&
            toArray(value.doencas_cronicas).toString() === prontuario.doencas_cronicas.toString() &&
            toArray(value.medicamentos_continuos).toString() === prontuario.medicamentos_continuos.toString() &&
            toArray(value.observacoes_gerais).toString() === prontuario.observacoes_gerais.toString();
        
        if (nadaMudou) {
            return res.status(400).json({ msg: "Nenhuma alteração foi realizada." });
        }


        await prontuario.update({
            alergias: toArray(value.alergias),
            doencas_cronicas: toArray(value.doencas_cronicas),
            medicamentos_continuos: toArray(value.medicamentos_continuos),
            observacoes_gerais: toArray(value.observacoes_gerais),
            atualizado_por: usuario.id,
            valores_antigos: [...prontuario.valores_antigos, valoresAntigos]

            
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
