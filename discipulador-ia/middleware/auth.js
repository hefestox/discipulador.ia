function exigirLogin(req, res, next) {
  if (!req.session.usuarioId) {
    return res.redirect("/login");
  }
  next();
}

function redirecionarSeLogado(req, res, next) {
  if (req.session.usuarioId) {
    return res.redirect("/painel");
  }
  next();
}

module.exports = { exigirLogin, redirecionarSeLogado };
