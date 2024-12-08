var createError = require('http-errors')
var express = require('express')
const mongoose = require('mongoose')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
let tasksRouter = require('./routes/tasks')
const passport = require('passport')
const session = require('express-session')
require('./config/passport')(passport)
var app = express()

//connection
mongoose.connect('mongodb://127.0.0.1:27017/task')
let connection = mongoose.connection
connection.once('open', () => console.log('Connected to db'))
connection.once('error', (error) => console.log(error))
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(session({ secret: 'doifausdofiu', resave: false, saveUninitialized: false, cookie: {} }))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/tasks', tasksRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
