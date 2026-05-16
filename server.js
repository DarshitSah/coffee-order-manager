import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import path from 'path';
import ejsLayouts from 'express-ejs-layouts';
import mongoose from 'mongoose';
import 'dotenv/config';
import validateOrder from './middleware/validateOrder.js';

const app = express();
const PORT = 3000;

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  coffeeType: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

app.use(ejsLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('index', { orders });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('orders', { orders });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

app.get('/orders/new', (req, res) => {
  res.render('new', { error: null });
});

app.post('/orders', validateOrder, async (req, res) => {
  try {
    const newOrder = new Order({
      customerName: req.body.customerName.trim(),
      coffeeType: req.body.coffeeType,
      size: req.body.size,
      quantity: parseInt(req.body.quantity)
    });

    await newOrder.save();
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creating order');
  }
});

app.get('/orders/:id/edit', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send('Order not found');
    }

    res.render('edit', { order, error: null });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

app.put('/orders/:id', validateOrder, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        customerName: req.body.customerName.trim(),
        coffeeType: req.body.coffeeType,
        size: req.body.size,
        quantity: parseInt(req.body.quantity)
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).send('Order not found');
    }

    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Coffee Order Manager running at http://localhost:${PORT}`);
});