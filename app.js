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

//Register endpoint
app.post('/register', async (req, res) => {
    const { username, password, type } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, type });
    res.status(201).json(user);
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



//CRUD


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

//accepting order by Admin
app.post('/approve-order/:id', authenticateJWT, async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.sendStatus(403);
    }
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (order) {
        const item = await Item.findByPk(order.itemId);
        if (item && item.quantity > 0) {
            await CurrentLoan.create({
                userId: order.userId,
                itemId: order.itemId,
                loanDate: new Date(),
                returnDate: null
            });
            item.quantity -= 1;
            await item.save();
            await order.destroy();
            res.sendStatus(200);
        } else {
            res.status(400).json({ message: 'Item not available' });
        }
    } else {
        res.sendStatus(404);
    }
});
