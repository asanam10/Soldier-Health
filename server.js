const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ================== CONFIG ==================
const PORT = 3000;
const MONGO_URI = "mongodb+srv://manasak1puf_db_user:ELaJGwWiRkYhS4pN@majorp.g5vcgnj.mongodb.net/?appName=majorp"; // e.g., mongodb+srv://user:pass@cluster0.mongodb.net/dbname?retryWrites=true&w=majority

// ================== MIDDLEWARE ==================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secretkey', // change this in production
  resave: false,
  saveUninitialized: true
}));

// ================== MONGODB ==================
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', userSchema);

// ================== ROUTES ==================

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login POST
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.send("Invalid username or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Invalid username or password");

  req.session.user = user;
  res.redirect('/dashboard');
});

// Serve dashboard only if logged in
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Optional: logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Optional: create a new user (for testing)
app.get('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const newUser = new User({ username: 'soldier1', password: hashedPassword });
  await newUser.save();
  res.send("User created!");
});

// ================== START SERVER ==================
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
