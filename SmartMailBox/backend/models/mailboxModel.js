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
        minlength: 1,
        trim: true
    },
    location: {
        type: String,
        default: '',
        trim: true
    },
    isLocked: {
        type: Boolean,
        default: true
    },
    path: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String
    },
    // tehtnica(random teza)
    weightKg: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensures mailbox labels are unique per user.
mailboxSchema.index({ owner: 1, label: 1 }, { unique: true });

var Mailbox = mongoose.model('mailbox', mailboxSchema);
module.exports = Mailbox;