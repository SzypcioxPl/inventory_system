const Item = require('./Item');
const CurrentLoan = require('./CurrentLoan');
const User = require('./User');
const Order = require('./Order');
// Definiowanie asocjacji
CurrentLoan.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Item.hasMany(CurrentLoan, { foreignKey: 'itemId', as: 'loans' });

CurrentLoan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CurrentLoan.belongsTo(User, { foreignKey: 'zaakceptował', as: 'admin' });

module.exports = { Item, CurrentLoan, User , Order};
