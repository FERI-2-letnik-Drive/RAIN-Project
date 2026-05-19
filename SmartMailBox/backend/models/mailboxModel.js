var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mailboxSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    label: {
        type: String,
        required: true,
        minlength: 1
    },
    location: {
        type: String,
        default: ''
    },
    isLocked: {
        type: Boolean,
        default: true
    },
    // tehtnica(random teza)
    weightKg: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

var Mailbox = mongoose.model('mailbox', mailboxSchema);
module.exports = Mailbox;