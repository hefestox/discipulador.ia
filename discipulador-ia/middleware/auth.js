const db = require("../db");

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

function obterUsuarioDaSessao(req) {
  if (!req.session.usuarioId) {
    return null;
  }

  if (req.session.usuarioEmail) {
    return {
      id: req.session.usuarioId,
      nome: req.session.usuarioNome,
      email: req.session.usuarioEmail,
    };
  }

  const usuario = db.buscarUsuarioPorId(req.session.usuarioId);
  if (usuario) {
    req.session.usuarioEmail = usuario.email;
    req.session.usuarioNome = usuario.nome;
    return usuario;
  }

  return null;
}

function calcularIsAdmin(req) {
  const usuario = obterUsuarioDaSessao(req);
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const usuarioEmail = (usuario?.email || "").trim().toLowerCase();
  return Boolean(adminEmail && usuarioEmail && usuarioEmail === adminEmail) || req.session.usuarioId === 1;
}

function exigirAdmin(req, res, next) {
  if (!req.session.usuarioId) {
    return res.redirect("/login");
  }

  if (!calcularIsAdmin(req)) {
    return res.status(403).send("Acesso negado.");
  }

  next();
}

module.exports = { exigirLogin, redirecionarSeLogado, exigirAdmin, calcularIsAdmin };
