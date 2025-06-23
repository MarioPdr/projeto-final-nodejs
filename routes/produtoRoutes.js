const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { requireLogin, requireAdmin } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.use(requireLogin);

router.get('/cadastrar', requireAdmin, produtoController.formCadastrarProduto);
router.post('/cadastrar', requireAdmin, upload.single('imagem'), produtoController.cadastrarProduto);

router.get('/', produtoController.listarProdutos);

module.exports = router;
