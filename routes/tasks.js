var express = require('express')
var router = express.Router()
let Task = require('../models/task')
const { body, validationResult } = require('express-validator')

// タスク一覧
router.get('/', (req, res) => {
    Task.find({ assignedTo: req.user.id }).then((tasks) => {
        res.render('task_list', { tasks })
    })
})

// タスク追加ページ
router.get('/add', (req, res) => {
    res.render('add_task')
})

// タスクを追加
router.post(
    '/add',
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
    body('estimatedTime').isInt({ gt: 0 }).withMessage('Estimated time must be a positive integer'),
    (req, res) => {
        console.log(req.body)

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('add_task', { errors: errors.array() })
        }

        let task = new Task({
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            assignedTo: req.user.id,
            estimatedTime: parseInt(req.body.estimatedTime),
        })

        task.save()
            .then(() => {
                res.redirect('/tasks')
            })
            .catch((error) => {
                console.log(error)
                res.render('add_task', { errors: [{ msg: 'Failed to save task' }] })
            })
    }
)

// タスク編集ページ
router.get('/edit/:id', (req, res) => {
    Task.findById(req.params.id)
        .then((task) => {
            if (!task || task.assignedTo.toString() !== req.user.id) {
                return res.status(404).render('error', { message: 'Task not found or not authorized' })
            }
            res.render('edit_task', { task })
        })
        .catch((error) => {
            console.log(error)
            res.status(500).render('error', { message: 'Failed to fetch task' })
        })
})

// タスクを更新
router.post('/edit/:id', (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('edit_task', { task: req.body, errors: errors.array() })
    }

    let updatedTask = {
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate,
        estimatedTime: parseInt(req.body.estimatedTime),
    }

    Task.updateOne({ _id: req.params.id, assignedTo: req.user.id }, updatedTask)
        .then(() => {
            res.redirect('/tasks')
        })
        .catch((err) => {
            console.log(err)
            res.status(500).render('error', { message: 'Failed to update task' })
        })
})

// タスク削除
router.get('/delete/:id', (req, res) => {
    Task.deleteOne({ _id: req.params.id, assignedTo: req.user.id })
        .then(() => {
            res.redirect('/tasks')
        })
        .catch((err) => {
            console.log(err)
            res.status(500).render('error', { message: 'Failed to delete task' })
        })
})

module.exports = router
