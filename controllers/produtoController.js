const db = require('../config/db');

exports.listarProdutos = async (req, res) => {
  try {
    const produtos = await db.any('SELECT * FROM produtos ORDER BY id DESC');
    produtos.forEach(p => {
      p.preco = parseFloat(p.preco);
    });
    res.render('produtos/index', {
      produtos,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send('Erro ao listar produtos');
  }
};

exports.formCadastrarProduto = (req, res) => {
  res.render('produtos/cadastro', {
    error: null,
    user: req.session.user 
  });
};


exports.cadastrarProduto = async (req, res) => {
  const { nome, preco, estoque } = req.body;
  const imagem = req.file?.filename;

  if (!nome || !preco || !estoque || !imagem) {
    return res.render('produtos/cadastro', { error: 'Preencha todos os campos e envie uma imagem.' });
  }

  try {
    await db.none(
      'INSERT INTO produtos (nome, preco, estoque, imagem) VALUES ($1, $2, $3, $4)',
      [nome, preco, estoque, imagem]
    );
    res.redirect('/produtos');
  } catch (err) {
    console.error(err);
    res.render('produtos/cadastro', { error: 'Erro ao cadastrar produto' });
  }
};
