var express = require('express');
var router = express.Router();
var mailboxController = require('../controllers/mailboxController.js');

// CRUD
router.get('/', mailboxController.list);
router.get('/:id', mailboxController.show);
router.post('/', mailboxController.create);
router.put('/:id', mailboxController.update);
router.delete('/:id', mailboxController.remove);

// Actions
router.post('/:id/unlock', mailboxController.unlock);
router.get('/:id/logs', mailboxController.getLogs);
router.get('/:id/weight', mailboxController.getWeight);

module.exports = router;