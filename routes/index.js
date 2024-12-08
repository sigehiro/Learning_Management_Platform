var express = require('express')
var router = express.Router()
let Task = require('../models/task')

router.get('/', function (req, res) {
    if (req.user) {
        Task.find({ assignedTo: req.user.id })
            .then((tasks) => {
                console.log(tasks)
                res.render('index', { title: 'Task Management', tasks })
            })
            .catch((error) => {
                console.error(error)
                res.render('error', { message: 'Failed to fetch tasks' })
            })
    } else {
        res.render('index', { title: 'Task Management', tasks: [] })
    }
})

module.exports = router
