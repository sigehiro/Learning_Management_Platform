var express = require('express')
var router = express.Router()
let Task = require('../models/goal')
const { body, validationResult } = require('express-validator')

// タスク一覧
router.get('/', (req, res) => {
    Task.find({ assignedTo: req.user.id }).then((tasks) => {
        res.render('task_list', { tasks })
    })
})

// タスク追加ページ
router.get('/add', (req, res) => {
    const year = 2024;
    const month = 11; //December
    const previousMonth = month - 1 < 0 ? 11 : month - 1;
    const nextMonth = month + 1 > 11 ? 0 : month + 1;
    const calendar = [
        ['', '', '', '', '', '', ''],
        ['1', '2', '3', '4', '5', '6', '7'],
        ['8', '9', '10', '11', '12', '13', '14'],
        ['15', '16', '17', '18', '19', '20', '21'],
        ['22', '23', '24', '25', '26', '27', '28'],
        ['29', '30', '31', '', '', '', '']
    ];
    res.render('add_goal', {
        year,
        month,
        previousMonth,
        nextMonth,
        calendar
    });
})

// タスクを追加
router.post(
    '/add',
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('dueDate').notEmpty().withMessage('At least one date must be selected'),
    (req, res) => {
        const year = 2024;
        const month = 11; //December
        const previousMonth = month - 1 < 0 ? 11 : month - 1;
        const nextMonth = month + 1 > 11 ? 0 : month + 1;
        const calendar = [
            ['', '', '', '', '', '', ''],
            ['1', '2', '3', '4', '5', '6', '7'],
            ['8', '9', '10', '11', '12', '13', '14'],
            ['15', '16', '17', '18', '19', '20', '21'],
            ['22', '23', '24', '25', '26', '27', '28'],
            ['29', '30', '31', '', '', '', '']
        ];
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('add_goal', {
                year,
                month,
                previousMonth,
                nextMonth,
                calendar,
                errors: errors.array()
            });
        }
        // Capture the selected dates
        const selectedDates = JSON.stringify(req.body.dueDate); // An array of selected dates
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            dueDate: selectedDates, // Store the array of dates
            assignedTo: req.user.id,
        });
        task.save()
            .then(() => {
                res.redirect('/');
            })
            .catch((error) => {
                console.log(error);
                res.render('add_goal', { errors: [{ msg: 'Failed to save task' }] });
            });
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
