var express = require('express')
var router = express.Router()
let Task = require('../models/task')
const { body, validationResult } = require('express-validator')
const { isAuthenticated } = require('../middleware/auth') 

// タスク一覧
// Welcome page for non-authenticated users
router.get('/', (req, res) => {
    console.log('Authentication status:', req.isAuthenticated());
    
    if (req.isAuthenticated()) {
        console.log('User is authenticated');
        Task.find({ assignedTo: req.user.id }).then((tasks) => {
            console.log('Tasks found:', tasks);
            res.render('task_list', { tasks, title: 'Tasks' })
        })
    } else {
        console.log('User is NOT authenticated');
        console.log('Attempting to render welcome-page');
        res.render('welcome-page', { title: 'Welcome' }, (err) => {
            if (err) {
                console.error('Error rendering welcome page:', err);
            }
        });
    }
})


// タスク追加ページ
router.get('/add', (req, res) => {
    res.render('add_task')
})

// タスクを追加
router.post('/add',
    isAuthenticated,
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
    body('estimatedTime').isInt({ gt: 0 }).withMessage('Estimated time must be a positive integer'),
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('add_task', { errors: errors.array() })
        }

        // Create date at midnight EST (this is hardcoded EST and ISN'T DYNAMIC)
        const date = new Date(req.body.dueDate + "T00:00:00-05:00");

        let task = new Task({
            title: req.body.title,
            description: req.body.description,
            dueDate: date,
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

// Update task status
router.post('/update-status/:id', async (req, res) => {
    try {
        await Task.findOneAndUpdate(
            { _id: req.params.id, assignedTo: req.user.id },
            { status: req.body.status }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// Task detail route
router.get('/task-detail', isAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id });
        res.render('task-detail', { 
            title: 'Task Detail',
            tasks: tasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Failed to load tasks' });
    }
});

module.exports = router
