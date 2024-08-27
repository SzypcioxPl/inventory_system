const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM,
        values: ['student', 'admin'],
        allowNull: false
    }
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    numer_indeksu: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = User;
