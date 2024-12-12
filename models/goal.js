let mongoose = require('mongoose');

let goalSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: String,
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    tasks: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Goal', goalSchema);
