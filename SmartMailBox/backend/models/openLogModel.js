var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var openLogSchema = new Schema({
    mailboxId: {
        type: Schema.Types.ObjectId,
        ref: 'mailbox',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    method: {
        type: String,
        enum: ['owner', 'permission'],
        required: true
    },
    // teža ob odprtju (fake podatek)
    weightKg: {
        type: Number,
        required: true
    },
    openedAt: {
        type: Date,
        default: Date.now
    }
});

var OpenLog = mongoose.model('openLog', openLogSchema);
module.exports = OpenLog;