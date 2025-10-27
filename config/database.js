const Sequelize = require("sequelize")
const sequelize = new Sequelize (
    "Vida+",
    "root",
    "toor", {
        host:"localhost",
        dialect: "mysql"
    }
)

sequelize.authenticate().then(() => {
    console.log("Sucesso ao se conectar no Banco de Dados")
}).catch((erro) => {
    console.log("Erro ao se conectar ao Banco de Dados" + erro)
})

module.exports = {
    sequelize: sequelize,
    Sequelize: Sequelize
}