const db = require("../config/database");
const Pacientes = require("./Pacientes");
const Medicos = require("./Medico");

const Prontuarios = db.sequelize.define("Prontuarios", {
    
    id_prontuario: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    id_paciente: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Pacientes,
            key: "id_paciente"
        }
    },

    alergias: {
        type: db.Sequelize.JSON,
        defaultValue: []
    },

    doencas_cronicas: {
        type: db.Sequelize.JSON,
        defaultValue: []
    },

    medicamentos_continuos: {
        type: db.Sequelize.JSON,
        defaultValue: []
    },

    observacoes_gerais: {
        type: db.Sequelize.JSON,
        defaultValue: []
    },

    status: {
        type: db.Sequelize.ENUM("ativo", "inativo"),
        defaultValue: "ativo"
    },

    atualizado_por: {
        type: db.Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: Medicos,
            key: "id_medico"
        },
        onSetNull: true
    },

    valores_antigos: {
        type: db.Sequelize.JSON,
        defaultValue: []
    }
});

Pacientes.hasOne(Prontuarios, { foreignKey: "id_paciente" });
Prontuarios.belongsTo(Pacientes, { foreignKey: "id_paciente" });

Medicos.hasMany(Prontuarios, { foreignKey: "atualizado_por" });
Prontuarios.belongsTo(Medicos, { foreignKey: "atualizado_por" });

Prontuarios.sync({ force: false });

module.exports = Prontuarios;
