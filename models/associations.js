const Item = require('./Item');
const CurrentLoan = require('./CurrentLoan');
const User = require('./User');
const Order = require('./Order');
// Definiowanie asocjacji
CurrentLoan.belongsTo(Item, {
     foreignKey: 'itemId',
      as: 'item',
      onDelete: 'CASCADE' // delete all loans when item is deleted
     });
Item.hasMany(CurrentLoan, {
     foreignKey: 'itemId',
      as: 'loans' ,
      onDelete: 'CASCADE' // delete all loans when item is deleted
    });

    Order.belongsTo(Item, {
        foreignKey: 'itemId',
        as: 'item',
        onDelete: 'CASCADE' // delete all orders when item is deleted
    });
    Item.hasMany(Order, {
        foreignKey: 'itemId',
        as: 'orders',
        onDelete: 'CASCADE' // delete all orders when item is deleted
    });     

CurrentLoan.belongsTo(User, {
     foreignKey: 'zaakceptował',
      as: 'admin' 
    });

CurrentLoan.belongsTo(User, {
    foreignKey: 'userId',
    as: 'loaner' // loaning user
});

CurrentLoan.belongsTo(User, {
    foreignKey: 'zaakceptował',
    as: 'approver' // admin who approved the loan
});


module.exports = { Item, CurrentLoan, User , Order};
