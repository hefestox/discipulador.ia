const express = require("express");
const db = require("../db");
const { exigirLogin, exigirAdmin, calcularIsAdmin } = require("../middleware/auth");
const { gerarPalavraMotivacional } = require("../services/groq");
const versiculos = require("../data/versiculos");
const historias = require("../data/historias");
const oracoes = require("../data/oracoes");

const router = express.Router();

router.get("/painel", exigirLogin, (req, res) => {
  const isAdmin = calcularIsAdmin(req);
  res.render("painel", { nome: req.session.usuarioNome, erro: null, isAdmin: isAdmin });
});

router.post("/painel/pergunta", exigirLogin, async (req, res) => {
  const sentimento = (req.body.sentimento || "").trim();

  if (!sentimento) {
    const isAdmin = calcularIsAdmin(req);
    return res.render("painel", { nome: req.session.usuarioNome, erro: "Conte como você está se sentindo antes de continuar.", isAdmin: isAdmin });
  }

  const { mensagem, categoria } = await gerarPalavraMotivacional(req.session.usuarioNome, sentimento);

  const listaVersiculos = versiculos[categoria] || versiculos.neutro;
  const versiculo = listaVersiculos[Math.floor(Math.random() * listaVersiculos.length)];
  const historia = historias[categoria] || historias.neutro;
  const oracao = oracoes[categoria] || oracoes.neutro;

  db.registrarJornada({
    usuarioId: req.session.usuarioId,
    sentimentoTexto: sentimento,
    categoria,
    palavraMotivacional: mensagem,
    versiculoReferencia: versiculo.ref,
    historiaTitulo: historia.titulo,
  });

  req.session.jornadaAtual = {
    sentimento,
    categoria,
    mensagem,
    versiculo,
    historia,
    oracao,
  };

  res.redirect("/painel/resultado");
});

router.get("/painel/resultado", exigirLogin, (req, res) => {
  const jornada = req.session.jornadaAtual;
  if (!jornada) {
    return res.redirect("/painel");
  }
  res.render("resultado", { nome: req.session.usuarioNome, jornada });
});

router.get("/admin", exigirLogin, exigirAdmin, (req, res) => {
  const estatisticas = db.obterEstatisticas();
  const usuarios = db.listarUsuariosAdmin();
  res.render("admin", { nome: req.session.usuarioNome, estatisticas, usuarios });
});

router.post("/painel/discipulado", exigirLogin, (req, res) => {
  const acao = req.body.acao;
  delete req.session.jornadaAtual;

  if (acao === "continuar") {
    return res.redirect("/painel");
  }
  res.render("despedida", { nome: req.session.usuarioNome });
});

module.exports = router;
