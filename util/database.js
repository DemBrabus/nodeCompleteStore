const Sequelize = require("sequelize");

const sequelize = new Sequelize("node_complete", "root", "Dem943143", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
