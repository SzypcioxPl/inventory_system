const express = require('express');
const sequelize = require('./config/database');
const User = require('./models/User');
const Item = require('./models/Item');
const Order = require('./models/Order');
const CurrentLoan = require('./models/CurrentLoan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require("cors");




     console.log('Database & tables created!');

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// sequelize.sync({ force: true })
//     .then(() => {
//         console.log('Database & tables created!');

sequelize.sync({ force: false }).then(() => {
    console.log('Database & tables created!');
});
    
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

//Register endpoint OLD
// app.post('/register', async (req, res) => {
//     const { username, password, type } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, password: hashedPassword, type });
//     res.status(201).json(user);
// });

//register endpoint
app.post('/register', async (req, res) => {
    const { username, password, type, email, numer_indeksu } = req.body;

    try {
        // hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            password: hashedPassword,
            type,
            email,
            numer_indeksu
        });

               const userResponse = {
            id: user.id,
            username: user.username,
            type: user.type,
            email: user.email,
            numer_indeksu: user.numer_indeksu,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error during user registration:', error);

        // handling unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email or numer_indeksu already exists' });
        }

        res.status(500).json({ message: 'Error during user registration' });
    }
});

//Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user.id, type: user.type }, 'your_secret_key');
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

//authentication
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (token) {
        jwt.verify(token, 'your_secret_key', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Endpoint to check if the user is an admin
app.get('/check-admin', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.type === 'admin') {
            return res.json({ isAdmin: true });
        } else {
            return res.json({ isAdmin: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get current user data except password
app.get('/me', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.userId },
            attributes: { exclude: ['password'] } // excluding password
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});



//===============================CRUD=======================================


//Adding item
app.post('/items', authenticateJWT, async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.sendStatus(403);
    }
    const { name, quantity, description } = req.body;
    const item = await Item.create({ name, quantity, description });
    res.status(201).json(item);
});

//Deleting items
app.delete('/items/:id', authenticateJWT, async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.sendStatus(403);
    }
    const { id } = req.params;
    const item = await Item.findByPk(id);
    if (item) {
        await item.destroy();
        res.sendStatus(204);
    } else {
        res.sendStatus(404);
    }
});


//Showing all items
app.get('/items', authenticateJWT, async (req, res) => {
    if (req.user.type === 'admin') {
        const items = await Item.findAll();
        res.json(items);
    } else {
        const items = await Item.findAll({ where: { quantity: { [Op.gt]: 0 } } });
        res.json(items);
    }
});

//================================================================================================

// showing pending orders
app.get('/admin/orders/pending', authenticateJWT, async (req, res) => {
    // is the user an admin?
    if (req.user.type !== 'admin') {
        return res.sendStatus(403); 
    }

    try {
        const pendingOrders = await Order.findAll({
            where: { status: 'pending' }
        });
        res.json(pendingOrders);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ message: 'Error fetching pending orders' });
    }
});

// showing accepted and rejected orders
app.get('/admin/orders/processed', authenticateJWT, async (req, res) => {
    // sprawdzenie, czy użytkownik jest administratorem
    if (req.user.type !== 'admin') {
        return res.sendStatus(403); 
    }

    try {
        const processedOrders = await Order.findAll({
            where: {
                status: ['accepted', 'rejected']  // filtering by status
            }
        });
        res.json(processedOrders);
    } catch (error) {
        console.error('Error fetching processed orders:', error);
        res.status(500).json({ message: 'Error fetching processed orders' });
    }
});


//showing orders for student
app.get('/student/orders', authenticateJWT, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                userId: req.user.userId
            }
        });

        if (orders.length > 0) {
            res.json(orders); 
        } else {
            res.status(404).json({ message: 'No orders found for this user' });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});


// Creating a new order 
app.post('/orders', authenticateJWT, async (req, res) => {
    try {
        const { itemId, ilosc } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.quantity < ilosc) {
            return res.status(400).json({ message: 'Not enough items available' });
        }

        const newOrder = await Order.create({
            userId: req.user.userId, 
            itemId: item.id,
            ilosc, 
            orderDate: new Date(),
            status: 'pending' 
        });

        return res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// calculating the number of days of the loan
app.get('/loans/days', authenticateJWT, async (req, res) => {
    try {
        // is the user logged in?
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const loans = await CurrentLoan.findAll({ where: { userId: req.user.id } });

        if (loans.length === 0) {
            return res.status(404).json({ message: 'No orders' });
        }

        const loansWithDays = loans.map(loan => {
            const loanDate = new Date(loan.loanDate);
            const currentDate = new Date();
            const timeDiff = Math.abs(currentDate - loanDate);
            const daysOnLoan = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            return {
                itemId: loan.itemId,
                daysOnLoan: daysOnLoan
            };
        });

        return res.status(200).json(loansWithDays);
    } catch (error) {
        console.error('Error retrieving loan days:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

//TODO: Implement the endpoint for returning an item

// FIXED Approve or reject order by Admin
app.post('/approve-order/:id', authenticateJWT, async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.sendStatus(403); // Only admins can approve/reject orders
    }

    const { id } = req.params;
    const { status } = req.body; // Accepting "status" from request body
    const order = await Order.findByPk(id);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const item = await Item.findByPk(order.itemId);
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }

    if (status === 'accepted') {
        if (item.quantity >= order.ilosc) {
            await CurrentLoan.create({
                userId: order.userId,
                itemId: order.itemId,
                loanDate: new Date(),
                returnDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default return date set to one month from loan date
                zaakceptowal: req.user.username, // Set the admin's username who accepted the order
                ilosc: order.ilosc,
            });

            item.quantity -= order.ilosc; // Update item quantity based on the order
            await item.save();
            await order.destroy(); // Remove the order after acceptance
            return res.status(200).json({ message: 'Order accepted and loan created' });
        } else {
            return res.status(400).json({ message: 'Item not available in requested quantity' });
        }
    } else if (status === 'rejected') {
        await order.destroy(); // Remove the order if it is rejected
        return res.status(200).json({ message: 'Order rejected' });
    } else {
        return res.status(400).json({ message: 'Invalid status value' });
    }
});


// OLD Orders accepting and rejecting
// app.patch('/orders/:orderId/status', authenticateJWT, async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const { status } = req.body;

//         // is User an admin?
//         if (req.user.type !== 'admin') {
//             return res.status(403).json({ message: 'Only admins can update order status' });
//         }

//         if (!['accepted', 'rejected'].includes(status)) {
//             return res.status(400).json({ message: 'Invalid status' });
//         }

//         const order = await Order.findByPk(orderId);
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         order.status = status;
//         await order.save();

//         //If accepted, update the item quantity and create a new loan
//         if (status === 'accepted') {
//             const item = await Item.findByPk(order.itemId);
//             if (item && item.quantity > 0) {
//                 await CurrentLoan.create({
//                     userId: order.userId,
//                     itemId: order.itemId,
//                     loanDate: new Date(),
//                     returnDate: null
//                 });
//                 item.quantity -= 1;
//                 await item.save();
//             } else {
//                 return res.status(400).json({ message: 'Item not available or out of stock' });
//             }
//         }

//         res.status(200).json({ message: `Order status updated to ${status}` });
//     } catch (error) {
//         console.error('Error updating order status:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// OLD accepting order by Admin
// app.post('/approve-order/:id', authenticateJWT, async (req, res) => {
//     if (req.user.type !== 'admin') {
//         return res.sendStatus(403);
//     }
//     const { id } = req.params;
//     const order = await Order.findByPk(id);
//     if (order) {
//         const item = await Item.findByPk(order.itemId);
//         if (item && item.quantity > 0) {
//             await CurrentLoan.create({
//                 userId: order.userId,
//                 itemId: order.itemId,
//                 loanDate: new Date(),
//                 returnDate: null
//             });
//             item.quantity -= 1;
//             await item.save();
//             await order.destroy();
//             res.sendStatus(200);
//         } else {
//             res.status(400).json({ message: 'Item not available' });
//         }
//     } else {
//         res.sendStatus(404);
//     }
// });

// showing all current loans (for admin)
app.get('/admin/current-loans', authenticateJWT, async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.sendStatus(403);
    }

    try {
        const loans = await CurrentLoan.findAll({
            where: {
                returnDate: null
            },
            include: [User, Item] 
        });
        res.json(loans);
    } catch (error) {
        console.error('Error fetching current loans:', error);
        res.status(500).json({ message: 'Error fetching current loans' });
    }
});

// showing current loans for the logged-in user
app.get('/user/current-loans', authenticateJWT, async (req, res) => {
    try {
        const loans = await CurrentLoan.findAll({
            where: {
                userId: req.user.userId, // zakładam, że `userId` jest w tokenie JWT
                returnDate: null
            },
            include: [Item] // Opcjonalnie: dołączenie informacji o przedmiocie
        });

        if (loans.length === 0) {
            return res.status(404).json({ message: 'No current loans found' });
        }

        res.json(loans);
    } catch (error) {
        console.error('Error fetching user\'s current loans:', error);
        res.status(500).json({ message: 'Error fetching user\'s current loans' });
    }
});
