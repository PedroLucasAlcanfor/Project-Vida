const db = require("../config/database")
const Pacientes = require("./Pacientes")

const Consultas = db.sequelize.define("Consultas", {

    id_consulta: {
		type: db.Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
    },
	id_paciente: {
		type: db.Sequelize.INTEGER,
		allowNull: true,
		references: {
			model: Pacientes,
			key: "id_paciente"
		}
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
	  	type: db.Sequelize.ENUM("Disponível", "Agendada", "Finalizada"),	
	  	defaultValue: "Disponível"
	},
	prioridade: {
		type: db.Sequelize.ENUM("N/D", "Baixa", "Média", "Alta", "Emergência"),
		defaultValue: "N/D",
		allowNull: false
	},
	horario: {
		type: db.Sequelize.STRING,
		allowNull: false
	},
	data:{
		type: db.Sequelize.DATE,
		allowNull:false
	},
	diagnostico: {
		type: db.Sequelize.TEXT,
		allowNull: true
	},
	prescricoes: {
		type: db.Sequelize.TEXT,
		allowNull: true
	}
	
})

Pacientes.hasMany(Consultas, { foreignKey: "id_paciente", as: "consultas" });
Consultas.belongsTo(Pacientes, { foreignKey: "id_paciente", as: "paciente" });


Consultas.sync({force:false})	
module.exports = Consultas