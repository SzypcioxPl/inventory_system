const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');

const CurrentLoan = sequelize.define('CurrentLoan', {
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    itemId: {
        type: DataTypes.INTEGER,
        references: {
            model: Item,
            key: 'id'
        }
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
        references: {
            model: User,
            key: 'id'
        }
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
