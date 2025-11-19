const db = require("../config/database")

const Paciente = db.sequelize.define("Pacientes", {

  id_paciente: {
    type: db.Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  senha: {
    type: db.Sequelize.STRING,
    allowNull: false
  }, 
  cpf: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  telefone: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  tipo: {
    type: db.Sequelize.STRING,
    defaultValue: "paciente"
  },
  ativo: {
    type: db.Sequelize.BOOLEAN,
    defaultValue: true
  }
})

module.exports = Paciente