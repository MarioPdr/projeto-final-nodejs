const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.showLogin = (req, res) => {
  const registered = req.query.registered === 'true';
  res.render('auth/login', { error: null, registered });
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await db.oneOrNone('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      return res.render('auth/login', { error: 'Email ou senha inválidos' });
    }
    req.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    };
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Erro ao logar' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

exports.showRegistro = (req, res) => {
  res.render('auth/registro', { error: null });
};

exports.registro = async (req, res) => {
  const { nome, email, senha, perfil } = req.body;
  try {
    const hash = await bcrypt.hash(senha, 10);
    await db.none(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4)',
      [nome, email, hash, perfil]
    );
    res.redirect('/login'); 
  } catch (err) {
    console.error(err);
    res.render('auth/registro', { error: 'Erro ao registrar' });
  }
};

exports.showDashboard = (req, res) => {
  res.render('dashboard', { user: req.session.user });
};

