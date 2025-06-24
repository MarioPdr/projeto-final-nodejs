exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.perfil !== 'admin') {
    return res.status(403).send('Acesso negado. Você precisa ser administrador.');
  }
  next();
};

