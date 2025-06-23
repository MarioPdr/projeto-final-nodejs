const express = require('express');
const session = require('express-session');  
const path = require('path');
require('dotenv').config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } 
}));

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');

app.use('/', authRoutes);
app.use('/produtos', produtoRoutes);
app.use('/vendas', vendaRoutes);


module.exports = app;
