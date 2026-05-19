var express = require('express');
var router = express.Router({ mergeParams: true }); // mergeParams da dobimo :mailboxId iz parent routerja
var permissionController = require('../controllers/permissionController.js');

router.get('/', permissionController.list);

router.post('/', permissionController.create);

router.put('/:id', permissionController.update);
router.delete('/:id', permissionController.remove);

module.exports = router;