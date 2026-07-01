const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { redirecionarSeLogado } = require("../middleware/auth");

const router = express.Router();

router.get("/registrar", redirecionarSeLogado, (req, res) => {
  res.render("registrar", { erro: null });
});

router.post("/registrar", redirecionarSeLogado, async (req, res) => {
  const { nome, email, senha, confirmarSenha } = req.body;

  if (!nome || !email || !senha) {
    return res.render("registrar", { erro: "Preencha todos os campos." });
  }
  if (senha.length < 6) {
    return res.render("registrar", { erro: "A senha precisa ter pelo menos 6 caracteres." });
  }
  if (senha !== confirmarSenha) {
    return res.render("registrar", { erro: "As senhas não coincidem." });
  }

  const emailNormalizado = email.toLowerCase().trim();
  const existente = db.buscarUsuarioPorEmail(emailNormalizado);
  if (existente) {
    return res.render("registrar", { erro: "Já existe uma conta com este e-mail." });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = db.criarUsuario({ nome: nome.trim(), email: emailNormalizado, senhaHash });

  req.session.usuarioId = usuario.id;
  req.session.usuarioNome = usuario.nome;
  res.redirect("/painel");
});

router.get("/login", redirecionarSeLogado, (req, res) => {
  res.render("login", { erro: null });
});

router.post("/login", redirecionarSeLogado, async (req, res) => {
  const { email, senha } = req.body;
  const usuario = db.buscarUsuarioPorEmail((email || "").toLowerCase().trim());

  if (!usuario) {
    return res.render("login", { erro: "E-mail ou senha inválidos." });
  }

  const senhaOk = await bcrypt.compare(senha || "", usuario.senhaHash);
  if (!senhaOk) {
    return res.render("login", { erro: "E-mail ou senha inválidos." });
  }

  req.session.usuarioId = usuario.id;
  req.session.usuarioNome = usuario.nome;
  res.redirect("/painel");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
