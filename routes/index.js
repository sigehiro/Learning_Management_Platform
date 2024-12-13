var express = require('express')
var router = express.Router()
let Task = require('../models/task')

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        Task.find({ assignedTo: req.user.id })
            .then((tasks) => {
                // Calculate today's progress
                const today = new Date().toDateString();
                const todaysTasks = tasks.filter(task => 
                    new Date(task.dueDate).toDateString() === today
                );
                const completedTodayTasks = todaysTasks.filter(task => 
                    task.status === 'completed'
                );
                const progressPercentage = todaysTasks.length > 0 
                    ? Math.round((completedTodayTasks.length / todaysTasks.length) * 100)
                    : 0;

                res.render('index', { 
                    title: 'Task Management',
                    tasks,
                    progressPercentage
                });
            });
    } else {
        res.render('welcome-page', { title: 'Welcome' });
    }
});

module.exports = router