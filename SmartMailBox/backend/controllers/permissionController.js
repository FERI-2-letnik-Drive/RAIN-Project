var PermissionModel = require('../models/permissionModel.js');
var MailboxModel = require('../models/mailboxModel.js');
var UserModel = require('../models/userModel.js');

module.exports = {

    /**
     * permissionController.list()
     */
    list: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.mailboxId)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                if (mailbox.owner.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ message: 'Only the owner can view permissions' });
                }

                PermissionModel.find({ mailboxId: req.params.mailboxId })
                    .populate('userId', 'username email')
                    .exec(function (err, permissions) {
                        if (err) return res.status(500).json({ message: 'Error when getting permissions', error: err });
                        return res.json(permissions);
                    });
            });
    },

    /**
     * permissionController.create()
     */
    create: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        MailboxModel.findById(req.params.mailboxId)
            .exec(function (err, mailbox) {
                if (err) return res.status(500).json({ message: 'Error when getting mailbox', error: err });
                if (!mailbox) return res.status(404).json({ message: 'Mailbox not found' });

                if (mailbox.owner.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ message: 'Only the owner can add permissions' });
                }

                if (!req.body.type) {
                    return res.status(400).json({ message: 'type is required' });
                }

                // user is identified either by email (preferred) or userId
                if (!req.body.email && !req.body.userId) {
                    return res.status(400).json({ message: 'email is required' });
                }

                if (!['permanent', 'temporary'].includes(req.body.type)) {
                    return res.status(400).json({ message: 'type must be permanent or temporary' });
                }

                // if it is temporary it needs valid dates
                if (req.body.type === 'temporary') {
                    if (!req.body.validFrom || !req.body.validUntil) {
                        return res.status(400).json({ message: 'validFrom and validUntil are required for temporary permissions' });
                    }
                    if (new Date(req.body.validFrom) >= new Date(req.body.validUntil)) {
                        return res.status(400).json({ message: 'validFrom must be before validUntil' });
                    }
                }

                function grantTo(targetUserId) {
                    // a user cannot grant access to themselves (they are already the owner)
                    if (targetUserId.toString() === req.session.userId.toString()) {
                        return res.status(400).json({ message: 'You already own this mailbox' });
                    }

                    // Replace any existing permission for this user on this mailbox,
                    // so re-granting access doesn't leave stale (e.g. expired) duplicates behind.
                    PermissionModel.deleteMany(
                        { mailboxId: req.params.mailboxId, userId: targetUserId },
                        function (err) {
                            if (err) return res.status(500).json({ message: 'Error when replacing permission', error: err });

                            var permission = new PermissionModel({
                                mailboxId: req.params.mailboxId,
                                userId: targetUserId,
                                type: req.body.type,
                                validFrom: req.body.validFrom || null,
                                validUntil: req.body.validUntil || null,
                                isActive: true
                            });

                            permission.save(function (err, permission) {
                                if (err) return res.status(500).json({ message: 'Error when creating permission', error: err });
                                return res.status(201).json(permission);
                            });
                        }
                    );
                }

                // resolve the target user by email
                if (req.body.email) {
                    UserModel.findOne({ email: req.body.email.trim() })
                        .exec(function (err, user) {
                            if (err) return res.status(500).json({ message: 'Error when looking up user', error: err });
                            if (!user) return res.status(404).json({ message: 'No user found with that email' });
                            return grantTo(user._id);
                        });
                } else {
                    return grantTo(req.body.userId);
                }
            });
    },

    /**
     * permissionController.update()
     */
    update: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        PermissionModel.findById(req.params.id)
            .populate('mailboxId')
            .exec(function (err, permission) {
                if (err) return res.status(500).json({ message: 'Error when getting permission', error: err });
                if (!permission) return res.status(404).json({ message: 'Permission not found' });

                if (permission.mailboxId.owner.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ message: 'Only the owner can edit permissions' });
                }

                if (req.body.type !== undefined) {
                    if (!['permanent', 'temporary'].includes(req.body.type)) {
                        return res.status(400).json({ message: 'type must be permanent or temporary' });
                    }
                    permission.type = req.body.type;
                }
                if (req.body.validFrom !== undefined) permission.validFrom = req.body.validFrom;
                if (req.body.validUntil !== undefined) permission.validUntil = req.body.validUntil;
                if (req.body.isActive !== undefined) permission.isActive = req.body.isActive;

                // date validation if type is temporary
                if (permission.type === 'temporary' && permission.validFrom && permission.validUntil) {
                    if (new Date(permission.validFrom) >= new Date(permission.validUntil)) {
                        return res.status(400).json({ message: 'validFrom must be before validUntil' });
                    }
                }

                permission.save(function (err, permission) {
                    if (err) return res.status(500).json({ message: 'Error when updating permission', error: err });
                    return res.json(permission);
                });
            });
    },

    /**
     * permissionController.remove()
     */
    remove: function (req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        PermissionModel.findById(req.params.id)
            .populate('mailboxId')
            .exec(function (err, permission) {
                if (err) return res.status(500).json({ message: 'Error when getting permission', error: err });
                if (!permission) return res.status(404).json({ message: 'Permission not found' });

                if (permission.mailboxId.owner.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ message: 'Only the owner can delete permissions' });
                }

                PermissionModel.findByIdAndRemove(req.params.id, function (err) {
                    if (err) return res.status(500).json({ message: 'Error when deleting permission', error: err });
                    return res.status(204).json();
                });
            });
    }
};