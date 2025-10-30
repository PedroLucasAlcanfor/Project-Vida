const db = require("../config/database")

const Consultas = db.sequelize.define("Consultas", {

        id_consulta: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
        },
        nomePaciente: {
        type: db.Sequelize.STRING,
        allowNull: false
        },
        nomeDoutor: {
        type: db.Sequelize.STRING,
        allowNull: false,
        },
        especialidadeConsulta: {
        type: db.Sequelize.STRING,
        allowNull: false
        }, 
        status: {
        type: db.Sequelize.STRING,
        defaultValue: "Agendada"
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

Consultas.sync({force:true})
module.exports = Consultas