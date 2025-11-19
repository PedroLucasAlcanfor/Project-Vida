const db = require("../config/database")

const Medico = db.sequelize.define("Medico", {

  id_medico: {
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
   cpf: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  senha: {
    type: db.Sequelize.STRING,
    allowNull: false
  }, 
  crm: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  tipo: {
    type: db.Sequelize.STRING,
    defaultValue: 'medico'
  },
  telefone: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  especialidade: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  ativo: {
    type: db.Sequelize.BOOLEAN,
    defaultValue: true
  }

})

module.exports = Medico