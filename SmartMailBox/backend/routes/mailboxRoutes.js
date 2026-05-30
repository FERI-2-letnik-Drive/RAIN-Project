var express = require('express');
// Vključimo multer za file upload
var multer = require('multer');
var upload = multer({storage: multer.memoryStorage() });

var router = express.Router();
var mailboxController = require('../controllers/mailboxController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

// CRUD
router.get('/', mailboxController.list);
// mailboxes shared with me (must be before '/:id' so 'shared' isn't treated as an id)
router.get('/shared', mailboxController.listShared);
router.get('/:id', mailboxController.show);
router.put('/:id', mailboxController.update);
router.delete('/:id', mailboxController.remove);

// create mailbox
router.post('/', requiresLogin, upload.single('image'), mailboxController.create)

// Actions
router.post('/:id/unlock', mailboxController.unlock);
router.get('/:id/logs', mailboxController.getLogs);
router.get('/:id/weight', mailboxController.getWeight);

module.exports = router;