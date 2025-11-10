const db = require("../config/database")
const Consultas = require("./Consultas")

const Prontuarios = db.sequelize.define("Prontuarios", {
    id_prontuario: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_consulta: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        references: {
        model: "Consultas",
        key: "id_consulta"
        }
    },
    diagnosticos: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    prescricoes: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    observacoes: {
        type: db.Sequelize.STRING,
        allowNull: false
    }
})

Consultas.hasOne(Prontuarios, { foreignKey: "id_consulta" })
Prontuarios.belongsTo(Consultas, { foreignKey: "id_consulta" })

module.exports = Prontuarios
