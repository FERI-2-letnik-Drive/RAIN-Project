const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

var MailboxModel = require('../models/mailboxModel.js');
var PermissionModel = require('../models/permissionModel.js');
var OpenLogModel = require('../models/openLogModel.js');


// 0-30 kg (fake tehtnica)
function generateFakeWeight() {
    return Math.round(Math.random() * 30 * 100) / 100;
}

function uploadToCloudinary(fileBuffer) {
    return new Promise(function (resolve, reject) {
        var uploadStream = cloudinary.uploader.upload_stream(
            { folder: "smartmailbox" },
            function (error, result) {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
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
     * mailboxController.listShared()
     * Returns mailboxes the current user has a valid (active, not expired) permission for.
     */
    listShared: async function (req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ message: 'Not logged in' });
            }

            var permissions = await PermissionModel.find({
                userId: req.session.userId,
                isActive: true
            });

            // keep only currently valid permissions (handles temporary date ranges)
            var validPermissions = permissions.filter(function (p) {
                return p.isValid();
            });

            var mailboxIds = validPermissions.map(function (p) {
                return p.mailboxId;
            });

            var mailboxes = await MailboxModel.find({ _id: { $in: mailboxIds } });

            // attach the access type for each mailbox
            var permByMailbox = {};
            validPermissions.forEach(function (p) {
                permByMailbox[p.mailboxId.toString()] = p.type;
            });

            var result = mailboxes.map(function (m) {
                var obj = m.toObject();
                obj.accessType = permByMailbox[m._id.toString()] || null;
                return obj;
            });

            return res.json(result);
        } catch (err) {
            return res.status(500).json({ message: 'Error when getting shared mailboxes', error: err.message });
        }
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

                // Check ALL active permissions for this user, not just the first one.
                // A user may have several (e.g. an old expired temporary + a valid permanent);
                // access should be granted if ANY of them is currently valid.
                PermissionModel.find({ mailboxId: mailbox._id, userId: req.session.userId, isActive: true })
                    .exec(function (err, permissions) {
                        if (err) return res.status(500).json({ message: 'Error checking permission', error: err });
                        var hasValid = permissions.some(function (p) { return p.isValid(); });
                        if (!hasValid) {
                            return res.status(403).json({ message: 'Access denied' });
                        }
                        return res.json(mailbox);
                    });
            });
    },

    /**
     * mailboxController.create()
     */
    create: async function (req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ message: "You must be logged in" });
            }

            if (!req.body.label || req.body.label.trim().length === 0) {
                return res.status(400).json({ message: "Mailbox label is required" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "QR code image is required" });
            }

            var label = req.body.label.trim();

            var existingMailbox = await MailboxModel.findOne({
                owner: req.session.userId,
                label: label
            });

            if (existingMailbox) {
                return res.status(400).json({
                    message: "Mailbox label already exists."
                });
            }

            var uploadResult = await uploadToCloudinary(req.file.buffer);

            var mailbox = new MailboxModel({
                owner: req.session.userId,
                label: label,
                location: req.body.location ? req.body.location.trim() : '',
                path: uploadResult.secure_url,
                cloudinaryPublicId: uploadResult.public_id
            });

            await mailbox.save();

            return res.status(201).json(mailbox);
        } catch (err) {
            return res.status(500).json({
                message: "Error when creating mailbox",
                error: err.message
            });
        }
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
    remove: async function (req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ message: 'Not logged in' });
            }

            const mailbox = await MailboxModel.findById(req.params.id);

            if (!mailbox) {
                return res.status(404).json({ message: 'Mailbox not found' });
            }

            if (mailbox.owner.toString() !== req.session.userId.toString()) {
                return res.status(403).json({ message: 'Only the owner can delete this mailbox' });
            }

            if (mailbox.cloudinaryPublicId) {
                await cloudinary.uploader.destroy(mailbox.cloudinaryPublicId);
            }

            await MailboxModel.findByIdAndRemove(req.params.id);

            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting mailbox',
                error: err.message
            });
        }
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

                PermissionModel.find({ mailboxId: mailbox._id, userId: req.session.userId, isActive: true })
                    .exec(function (err, permissions) {
                        if (err) return res.status(500).json({ message: 'Error checking permission', error: err });
                        var hasValid = permissions.some(function (p) { return p.isValid(); });
                        if (!hasValid) {
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
