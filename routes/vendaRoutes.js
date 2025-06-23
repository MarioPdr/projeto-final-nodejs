const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');
const { requireLogin } = require('../middlewares/authMiddleware');

router.use(requireLogin);

router.get('/', vendaController.formVenda);
router.post('/', vendaController.registrarVenda);
router.get('/listar', vendaController.listarVendas);

module.exports = router;
