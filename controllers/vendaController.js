const db = require('../models/db');

exports.formVenda = async (req, res) => {
  try {
    const produtos = await db.any('SELECT * FROM produtos WHERE estoque > 0');
    produtos.forEach(p => p.preco = parseFloat(p.preco));
    res.render('vendas/index', { produtos, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar formulário de venda');
  }
};

exports.registrarVenda = async (req, res) => {
  let produtos = [];
  try {
    produtos = JSON.parse(req.body.produtos || '[]');
  } catch {
    produtos = [];
  }
  
  if (!Array.isArray(produtos) || produtos.length === 0) {
    const produtosDisponiveis = await db.any('SELECT * FROM produtos WHERE estoque > 0');
    return res.render('vendas/index', { produtos: produtosDisponiveis, error: 'Selecione ao menos um produto.' });
  }

  const id_usuario = req.session.user.id;

  try {
    await db.tx(async t => {
      const venda = await t.one(
        'INSERT INTO vendas (id_usuario) VALUES ($1) RETURNING id',
        [id_usuario]
      );

      for (const p of produtos) {
        const { id, quantidade } = p;
        const produto = await t.one('SELECT preco, estoque FROM produtos WHERE id = $1', [id]);

        if (produto.estoque < quantidade) {
          throw new Error(`Estoque insuficiente para o produto ${id}`);
        }

        await t.none(
          'INSERT INTO itens_venda (id_venda, id_produto, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [venda.id, id, quantidade, produto.preco]
        );

        await t.none('UPDATE produtos SET estoque = estoque - $1 WHERE id = $2', [quantidade, id]);
      }
    });

    res.redirect('/vendas/listar');
  } catch (err) {
    console.error(err);
    const produtosDisponiveis = await db.any('SELECT * FROM produtos WHERE estoque > 0');
    res.render('vendas/index', { produtos: produtosDisponiveis, error: 'Erro ao registrar venda' });
  }
};

exports.listarVendas = async (req, res) => {
  try {
    let vendas = await db.any(`
      SELECT v.id, v.data, u.nome AS vendedor,
        SUM(iv.quantidade * iv.preco_unitario) AS total
      FROM vendas v
      JOIN usuarios u ON u.id = v.id_usuario
      JOIN itens_venda iv ON iv.id_venda = v.id
      GROUP BY v.id, u.nome
      ORDER BY v.data DESC
    `);

    vendas = vendas.map(v => ({
      ...v,
      total: v.total ? parseFloat(v.total) : 0,
    }));

    res.render('vendas/listar', { vendas });
  } catch (err) {
    res.status(500).send('Erro ao listar vendas');
  }
};
