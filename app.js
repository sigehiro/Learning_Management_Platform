var createError = require('http-errors')
var express = require('express')
const mongoose = require('mongoose')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
let tasksRouter = require('./routes/tasks')
let goalsRouter = require('./routes/goals')
const passport = require('passport')
const session = require('express-session')
require('./config/passport')(passport)
var app = express()

// MongoDB connection
mongoose
    .connect('mongodb://127.0.0.1:27017/task')
    .then(() => console.log('Connected to db'))
    .catch((error) => console.error('MongoDB connection error:', error))

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Middleware
app.use(session({ secret: 'doifausdofiu', resave: false, saveUninitialized: false, cookie: {} }))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Make user available in all templates
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// Routes
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/goals', goalsRouter)
app.use('/tasks', tasksRouter)

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// Error handler
app.use(function (err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // Render the error page
    res.status(err.status || 500)
    res.render('error')
})

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app
