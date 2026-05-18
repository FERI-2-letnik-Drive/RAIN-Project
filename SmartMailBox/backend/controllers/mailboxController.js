var MailboxModel = require('../models/mailboxModel.js');
var PermissionModel = require('../models/permissionModel.js');
var OpenLogModel = require('../models/openLogModel.js');

// 0-30 kg (fake tehtnica)
function generateFakeWeight() {
    return Math.round(Math.random() * 30 * 100) / 100;
}

module.exports = {

    /**
     * mailboxController.list()
     */
    list: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.find({ owner: req.session.userId })
            .exec(function (err, mailboxes) {
                if (err) {
                    return res.status(500).json({ message: 'Error when getting mailboxes', error: err });
                }
                return res.json(mailboxes);
            });
    },

    /**
     * mailboxController.show()
     */
    show: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.id)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                if (mailbox.owner.toString() === req.session.userId.toString()) {
                    return res.json(mailbox);
                }

                PermissionModel.findOne({ mailboxId: mailbox._id, userId: req.session.userId, isActive: true })
                    .exec(function (err, permission) {
                        if (err) return res.status(500).json({ message: 'Error checking permission', error: err });
                        if (!permission || !permission.isValid()) {
                            return res.status(403).json({ message: 'Access denied' });
                        }
                        return res.json(mailbox);
                    });
            });
    },

    /**
     * mailboxController.create()
     */
    create: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        if (!req.body.label) {
            return res.status(400).json({ message: 'Label is required' });
        }

        var mailbox = new MailboxModel({
            owner: req.session.userId,
            label: req.body.label,
            location: req.body.location || ''
        });

        mailbox.save(function (err, mailbox) {
            if (err) return res.status(500).json({ message: 'Error when creating mailbox', error: err });
            return res.status(201).json(mailbox);
        });
    },

    /**
     * mailboxController.update()
     */
    update: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.id)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                if (mailbox.owner.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ message: 'Only the owner can edit this mailbox' });
                }

                mailbox.label = req.body.label || mailbox.label;
                mailbox.location = req.body.location !== undefined ? req.body.location : mailbox.location;

                mailbox.save(function (err, mailbox) {
                    if (err) return res.status(500).json({ message: 'Error when updating mailbox', error: err });
                    return res.json(mailbox);
                });
            });
    },

    /**
     * mailboxController.remove()
     */
    remove: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.id)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                if (mailbox.owner.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ message: 'Only the owner can delete this mailbox' });
                }

                MailboxModel.findByIdAndRemove(req.params.id, function (err) {
                    if (err) return res.status(500).json({ message: 'Error when deleting mailbox', error: err });
                    return res.status(204).json();
                });
            });
    },

    /**
     * mailboxController.unlock()
     */
    unlock: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.id)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                var userId = req.session.userId.toString();
                var isOwner = mailbox.owner.toString() === userId;

                function doUnlock(method) {
                    var fakeWeight = generateFakeWeight();

                    mailbox.isLocked = false;
                    mailbox.weightKg = fakeWeight;

                    mailbox.save(function (err) {
                        if (err) return res.status(500).json({ message: 'Error when unlocking mailbox', error: err });

                        var log = new OpenLogModel({
                            mailboxId: mailbox._id,
                            userId: req.session.userId,
                            method: method,
                            weightKg: fakeWeight
                        });

                        log.save(function (err, log) {
                            if (err) return res.status(500).json({ message: 'Error when saving log', error: err });

                            return res.json({
                                message: 'Mailbox unlocked',
                                weightKg: fakeWeight,
                                openedAt: log.openedAt,
                                method: method
                            });
                        });
                    });
                }

                if (isOwner) {
                    return doUnlock('owner');
                }

                PermissionModel.findOne({ mailboxId: mailbox._id, userId: req.session.userId, isActive: true })
                    .exec(function (err, permission) {
                        if (err) return res.status(500).json({ message: 'Error checking permission', error: err });
                        if (!permission || !permission.isValid()) {
                            return res.status(403).json({ message: 'Access denied: no valid permission' });
                        }
                        return doUnlock('permission');
                    });
            });
    },

    /**
     * mailboxController.getLogs()
     */
    getLogs: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.id)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                if (mailbox.owner.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ message: 'Only the owner can view logs' });
                }

                OpenLogModel.find({ mailboxId: mailbox._id })
                    .populate('userId', 'username email')
                    .sort({ openedAt: -1 })
                    .exec(function (err, logs) {
                        if (err) return res.status(500).json({ message: 'Error when getting logs', error: err });
                        return res.json(logs);
                    });
            });
    },

    /**
     * mailboxController.getWeight()
     */
    getWeight: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.id)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                return res.json({ weightKg: mailbox.weightKg });
            });
    }
};