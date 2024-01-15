const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./users');
const app = express();
const port = 2000;
const cors=require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.connect('mongodb+srv://vvansh739:kJmYUw89ZLkADPnp@cluster0.bcw2xzn.mongodb.net/?retryWrites=true&w=majority');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
async function authenticateUser(req, res, next) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
app.post('/signin', authenticateUser, (req, res) => {
  res.json({ message: 'Login successful', user: req.user });
});
async function checkUserExists(req, res, next) {
    const { username, password } = req.body;
  
    try {
        const existingUser = await User.findOne({ username });

      if (existingUser) {
        res.status(400).json({ message: 'Username or email already exists' });
      } else {
        next();
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  app.post('/signup', checkUserExists, async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const newUser = new User({ username, password});
      await newUser.save();
      res.json({ message: 'Signup successful', user: newUser });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
