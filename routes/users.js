var express = require('express')
var router = express.Router()
var User = require('../models/user')
const passport = require('passport')
const { isAuthenticated } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/profiles')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        if (extname) {
            return cb(null, true)
        }
        cb(new Error('Only image files (jpeg/jpg/png) can be uploaded.'))
    },
})

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

//Profile
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.user })
})
//TODOProfile image の選択語にすぐに画像が反映されるようにする。現状はuoloadのボタンを押さないと反映されない
router.post('/profile', isAuthenticated, upload.single('profileImage'), async (req, res, next) => {
    try {
        const updates = {
            nickname: req.body.nickname,
            gender: req.body.gender,
            country: req.body.country,
            language: req.body.language,
            timeZone: req.body.timeZone, //TODOtimeZoneを取得してLocalと時間を一致させる現状は1日遅れてる
        }

        if (req.file) {
            updates.profileImage = `/uploads/profiles/${req.file.filename}`
        }

        await User.findByIdAndUpdate(req.user.id, updates)
        res.redirect('/users/profile')
    } catch (error) {
        next(error)
    }
})

module.exports = router
