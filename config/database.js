const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sdworak', 'somelogin', 'somepassword', {
    host: 'mysql.agh.edu.pl',
    port: '3306',
    dialect: 'mysql'
});

module.exports = sequelize;
