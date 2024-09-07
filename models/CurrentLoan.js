const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CurrentLoan = sequelize.define('CurrentLoan', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    loanDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    zaakceptował: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ilosc: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM,
        values: ['active', 'waiting', 'inactive'],
        defaultValue: 'active',
        allowNull: false
    },
    returnImagePath: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = CurrentLoan;
