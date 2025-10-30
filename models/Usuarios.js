const db = require("../config/database")

const Usuarios = db.sequelize.define("Usuarios", {
  id_usuario: {
    type: db.Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  genero: {
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
  cargo: {
    type: db.Sequelize.ENUM("admin", "medico", "recepcao"),
    allowNull: false
  },
  ativo: {
    type: db.Sequelize.BOOLEAN,
    defaultValue: true
  },
  credencial: {
    type: db.Sequelize.STRING,
    allowNull: true
  }

});

Usuarios.sync({force:false})
module.exports = Usuarios