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
  senha: {
    type: db.Sequelize.STRING,
    allowNull: false
  }, 
  crm: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  telefone: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  especialidade: {
    type: db.Sequelize.STRING,
    allowNull: false
  }

})

Medico.sync({force:true})
module.exports = Medico