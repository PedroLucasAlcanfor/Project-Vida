const db = require("../config/database");
const Consultas = require("../models/Consultas");
const Medicos = require("../models/Medico");

const Triagens = db.sequelize.define("Triagens", {
    id_triagem: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_consulta: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Consultas,
            key: "id_consulta"
        }
    },
    id_medico_responsavel: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Medicos,
            key: "id_medico"
        }
    },
    pressao: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    temperatura: {
        type: db.Sequelize.FLOAT,
        allowNull: false
    },
    batimentos: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    sintomas: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    observacoes: {
        type: db.Sequelize.STRING,
        allowNull: true
    } 
});

Triagens.belongsTo(Consultas, { foreignKey: "id_consulta" });
Consultas.hasOne(Triagens, { foreignKey: "id_consulta" });

Triagens.belongsTo(Medicos, { foreignKey: "id_medico_responsavel" });
Medicos.hasMany(Triagens, { foreignKey: "id_medico_responsavel" });

module.exports = Triagens;
