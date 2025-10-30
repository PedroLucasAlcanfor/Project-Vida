const Pacientes = require("../models/Pacientes")
const Joi = require("joi");
const db = require("../config/database")

criarPacienteSchema = Joi.object({
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
        "string.length": "A senha deve ter exatamente 6 caracteres",
        "string.empty": "A senha não pode ser vazia",
        
    }),
    cpf: Joi.string().trim().required().pattern(/^\d{11}$/)
    .messages({
        "string.pattern.base": "O cpf deve conter 11 dígitos",
        "any.required": "O cpf é obrigatório "
    }),
    telefone: Joi.string().trim().required().pattern(/^\d{11}$/)
    .messages({
        "string.pattern.base": "O número deve conter 11 dígitos",
        "any.required": "O número é obrigatório "
    })
})

module.exports = { 

    async listrarPaciente(req,res){

    },
//ADM cadastra paciente
    async cadastrarPaciente(req,res){
      
        try{
            const { error, value } = criarPacienteSchema.validate(req.body, { abortEarly: false });
            if (error) {
            const mensagens = error.details.map(d => d.message);
            return res.status(400).json({ erros: mensagens });
                }

            const emailExistente = await Pacientes.findOne({ where: { email: value.email } });
            const nomeExistente = await Pacientes.findOne({ where: { nome: value.nome } });

            if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });
            if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

            const paciente = await Pacientes.create(value);
            res.status(201).json({ msg: "Paciente criado com sucesso!", paciente });

    }catch(erro){
        console.error(erro);
        res.status(500).json({ msg: "Erro ao criar paciente." });
  }
  
},

//Paciente se cadastra
 async registrarPaciente(req,res){
      
    try{
        const { error, value } = criarPacienteSchema.validate(req.body, { abortEarly: false });
        if (error) {
        const mensagens = error.details.map(d => d.message);
        return res.status(400).json({ erros: mensagens });
            }

        const emailExistente = await Pacientes.findOne({ where: { email: value.email } });
        const nomeExistente = await Pacientes.findOne({ where: { nome: value.nome } });

        if (emailExistente) return res.status(409).json({ msg: "E-mail já cadastrado." });
        if (nomeExistente) return res.status(409).json({ msg: "Nome já existente." });

        const paciente = await Pacientes.create(value);
        res.status(201).json({ msg: "Paciente criado com sucesso!", paciente });

}catch(erro){
    console.error(erro);
    res.status(500).json({ msg: "Erro ao criar paciente." });
}

 },

//ADM e recepcionista pode atualizar paciente 
async atualizarPaciente(req,res){
    try{

    }catch(erro){

    }
},
async ativarPaciente(req,res){
    try{

    }catch(erro){

    }
},
async desativarPaciente(req,res){
    try{

    }catch(erro){ 

    }
}
}