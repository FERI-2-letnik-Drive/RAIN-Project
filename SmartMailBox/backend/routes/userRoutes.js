var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });

/*
 * GET
 */
router.get('/', userController.list);

/*
 * GET
 */
router.get('/profile', userController.profile);
router.get('/logout', userController.logout)
router.get('/:id', userController.show);

/*
 * POST
 */
router.post('/register', userController.create);
router.post('/login', userController.login);
router.post('/mobile-login', userController.mobileLogin);
router.post('/mobile-login/face-verify', upload.single('current_image'), userController.mobileFaceVerifyLogin);
router.post('/2fa/enable', upload.single('image'), userController.enableTwoFactor);

/*
 * PUT
 */
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.put('/:id', userController.update);

/*
 * DELETE
 */
router.delete('/:id', userController.remove);

module.exports = router;
