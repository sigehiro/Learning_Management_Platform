var express = require('express')
var router = express.Router()
var User = require('../models/user')
const passport = require('passport')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource')
})

router
    .route('/register')
    .get((req, res, next) => {
        res.render('register')
    })
    .post((req, res, next) => {
        let user = new User()
        user.name = req.body.name
        user.password = req.body.password
        user.email = req.body.email
        user.save().then(() => {
            res.redirect('/users/login')
        })
    })

router
    .route('/login')
    .get((req, res, next) => {
        res.render('login')
    })
    .post((req, res, next) => {
        passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureMessage: true })(
            req,
            res,
            next
        )
    })

router.route('/logout').get((req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        res.redirect('/')
    })
})
module.exports = router
