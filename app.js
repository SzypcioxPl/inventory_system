const express = require('express');
const sequelize = require('./config/database');

const { Item, CurrentLoan, User , Order } = require('./models/associations');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require("cors");
const multer = require('multer');
const path = require('path');
 
console.log('Database & tables created!');

const app = express();
app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

 app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// sequelize.sync({ force: true })
//     .then(() => {
//         console.log('Database & tables created!');

sequelize.sync()
    .then(() => {
        console.log('Baza danych została zaktualizowana');
    })
    .catch(err => {
        console.error('Błąd podczas synchronizacji z bazą danych:', err);
    });
    
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // default folder for file uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // ex. 1622471652987.jpg
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

//================================================================================================
//===============================ENDPOINTS========================================================
//================================================================================================


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


//======================================ORDERS==================================================

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
                status: 'active' // Default status set to ACTIVE NOT 'ACCEPTED'
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


//======================================LOANS======================================================

// showing all current loans (for admin)
app.get('/admin/current-loans', authenticateJWT, async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.sendStatus(403);
    }

    try {
        const loans = await CurrentLoan.findAll({
            include: [
                { model: User, as: 'loaner' }, 
                { model: Item, as: 'item' }
            ]
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
                userId: req.user.userId, 
            },
            include: [
                { model: Item, as: 'item' }  // alias 'item'
            ]
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

// sending loan image by user
app.post('/return/:loanId', authenticateJWT, upload.single('image'), async (req, res) => {
    try {
        const { loanId } = req.params;
        const loan = await CurrentLoan.findByPk(loanId);

        if (!loan || loan.userId !== req.user.id) {
            return res.status(404).json({ message: 'Loan not found or unauthorized' });
        }

        // const imagePath = req.file.path;  // TODO

        loan.returnDate = new Date();
        // loan.returnImagePath = imagePath;  // TODO
        await loan.save();

        res.status(200).json({ message: 'Return initiated successfully', loan });
    } catch (error) {
        console.error('Error during return process:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// sending return request by user
app.post('/loans/:id/request-return', authenticateJWT, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const loanId = req.params.id;

        //is the loan available for the user?
        const loan = await CurrentLoan.findOne({
            where: {
                id: loanId,
                userId: req.user.id
            }
        });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found or not accessible' });
        }

        // // does the user have an image uploaded?
        // if (!loan.imagePath) {
        //     return res.status(400).json({ message: 'Image is required before requesting a return' });
        // }

        // updating the loan status to 'waiting'
        loan.status = 'waiting';
        await loan.save();

        return res.status(200).json({ message: 'Return request submitted successfully', loan });
    } catch (error) {
        console.error('Error submitting return request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

//Accepting loan by admin
app.post('/admin/loans/:id/accept', authenticateJWT, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Only admins can perform this action' });
        }

        const loanId = req.params.id;

        const loan = await CurrentLoan.findOne({
            where: {
                id: loanId,
            }
        });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // find the item related to the loan
        const item = await Item.findByPk(loan.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // update the item quantity
        item.quantity += loan.ilosc;
        await item.save();

        // delete the loan
        await loan.destroy();

        return res.status(200).json({ message: 'Loan accepted and item quantity updated successfully' });
    } catch (error) {
        console.error('Error accepting loan:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// showing image for curent loan
app.get('/admin/loans/:id/image', authenticateJWT, async (req, res) => {
    if (req.user.type !== 'admin') {
        return res.sendStatus(403);
    }

    try {
        const loan = await CurrentLoan.findByPk(req.params.id);

        if (!loan || !loan.imagePath) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Send the image file
        res.sendFile(path.join(__dirname, loan.imagePath));
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ message: 'Error fetching image' });
    }
});
//TODO: Deleting user account
//TODO: Updating user account
//TODO: Updating item
//TODO: Images of items

