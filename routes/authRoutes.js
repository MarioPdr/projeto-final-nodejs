const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireLogin } = require('../middlewares/authMiddleware');

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/registro', authController.showRegistro);
router.post('/registro', authController.registro);

router.get('/dashboard', requireLogin, authController.showDashboard);

module.exports = router;
