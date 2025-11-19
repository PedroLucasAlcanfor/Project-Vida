const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Usuarios = require("../models/Usuarios");
const Pacientes = require("../models/Pacientes");
const Medicos = require("../models/Medico");
require("dotenv").config();

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      let usuario = await Usuarios.findOne({ where: { email } });
      let tipo = "null";
      
 if (usuario) {
        tipo = usuario.tipo;
      } else {
        usuario = await Pacientes.findOne({ where: { email } });
        if (usuario) {
          tipo = "paciente";
        } else {
          usuario = await Medicos.findOne({ where: { email } });
          if (usuario) {
            tipo = "medico";
          }
        }
      }

      if (!usuario) {
        usuario = await Pacientes.findOne({ where: { email } });
        tipo = "paciente";
      }

      if (!usuario) {
        usuario = await Medicos.findOne({ where: { email } });
        tipo = "medico";
      }

      if (!usuario) {
        return res.status(400).json({ msg: "Email não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ msg: "Senha incorreta" });
      }

      const token = jwt.sign(
        {
          id: usuario.id_usuario || usuario.id_paciente || usuario.id_medico,
          nome: usuario.nome,
          tipo, 
        },
        process.env.JWT_SECRET, 
        { expiresIn: "8h" } 
      );
      res.json({
        msg: "Login realizado com sucesso",
        id: usuario.id_usuario || usuario.id_paciente || usuario.id_medico,
        nome: usuario.nome,
        tipo, 
        token,
      });
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      res.status(500).json({ msg: "Erro no servidor ao realizar login" });
    }
  }
};
