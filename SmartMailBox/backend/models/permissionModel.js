var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var permissionSchema = new Schema({
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
    type: {
        type: String,
        enum: ['permanent', 'temporary'],
        required: true
    },
    // zacasni dostop
    validFrom: {
        type: Date,
        default: null
    },
    validUntil: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

permissionSchema.methods.isValid = function() {
    if (!this.isActive) return false;
    if (this.type === 'permanent') return true;

    const now = new Date();
    return (!this.validFrom || now >= this.validFrom) &&
           (!this.validUntil || now <= this.validUntil);
};

var Permission = mongoose.model('permission', permissionSchema);
module.exports = Permission;