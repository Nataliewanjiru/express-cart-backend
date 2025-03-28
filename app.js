var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRoutes= require('./routes/auth')
const profileRoutes = require('./routes/profile')
const cartItemsRoutes = require('./routes/cartitem')
const cartGroupRoutes = require('./routes/cartgroup')
const cartMembershipsRoutes =require('./routes/membership')
const connectDB = require('./config/db');

const app = express();
app.use(cors());

// connect to MongoDB
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRoutes);
app.use('/auth',profileRoutes);
app.use('/api/cart-items',cartItemsRoutes)
app.use("/api/cart-groups", cartGroupRoutes);
app.use('/api/memberships',cartMembershipsRoutes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
