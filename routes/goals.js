var express = require('express')
var router = express.Router()
let Task = require('../models/goal')
const { body, validationResult } = require('express-validator')

// タスク一覧
router.get('/listTasks/:title', (req, res) => {
    const title = req.params.title;  // Extract title from the URL
    Task.find({ title: title, assignedTo: req.user.id })  // Find tasks associated with this goal and user
        .then((goals) => {
            if (!goals) {
                return res.status(404).render('error', { message: 'Goal not found' });
            }
            if (!(goals[0])) {
                return res.status(404).render('error', { message: 'Goal not found' });
            }
            const tasks = JSON.parse(goals[0].tasks);
            console.log(tasks);
            res.render('goal_detail', { title, tasks });  // Render goal page with associated tasks
        })
        .catch((error) => {
            console.log(error);
            res.status(500).render('error', { message: 'Failed to fetch goal details or tasks' });
        });
});

router.get('/addTask/:title', (req, res) => {
    const title = req.params.title;
    console.log("override now");
    console.log({ title });
    res.render('add_task', { title });
});

router.post(
    '/addTask/:title',
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('dueDate').notEmpty().withMessage('Due Date is required'),
    body('estimatedTime').notEmpty().withMessage('Estimated Time is required'),
    (req, res) => {
        const title = req.params.title;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return Task.find({ title: title, assignedTo: req.user.id })  // Find tasks associated with this goal and user
                .then((goal) => {
                    res.render('add_task', { goal, errors: errors.array() });
                })
                .catch((error) => {
                    res.status(500).render('error', { message: 'Failed to retrieve goal for error handling' });
                });
        }

        // Create the new task
        const newTask = {
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            estimatedTime: req.body.estimatedTime
        };

        // Find the goal and update the tasks field
        Task.findOne({ title: title, assignedTo: req.user.id })
            .then(taskDoc => {
                // Parse the current tasks string (if it exists) into an array
                const tasks = taskDoc.tasks ? JSON.parse(taskDoc.tasks) : [];  // If tasks is null or empty, initialize as an empty array

                // Add the new task to the tasks array
                tasks.push(newTask);

                // Convert the updated tasks array back to a string
                const updatedTasksString = JSON.stringify(tasks);

                // Now, update the tasks field with the new string
                return Task.findOneAndUpdate({ title: title, assignedTo: req.user.id }, {
                    $set: { tasks: updatedTasksString }
                });
            })
            .then(() => {
                res.redirect(`/goals/listTasks/${title}`);
            })
            .catch((error) => {
                console.log(error);
                res.status(500).render('error', { message: 'Failed to add task to goal' });
            });
    }
);

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
            tasks: "[]",
        });
        task.save()
            .then(() => {
                res.redirect(`/goals/listTasks/${req.body.title}`);
            })
            .catch((error) => {
                console.log(error);
                res.render('add_goal', {
                    year,
                    month,
                    previousMonth,
                    nextMonth,
                    calendar,
                    errors: [{ msg: 'Failed to save task' }] });
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
