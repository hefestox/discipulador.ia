const express = require("express");
const { encodePix } = require("brcode");

const router = express.Router();

// Gera o payload EMV/BR Code para Pix estático usando a biblioteca brcode
function gerarPixPayload({ chave, nome, cidade, descricao, valor }) {
  const nomeFormatado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 25)
    .trim();

  const cidadeFormatada = cidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 15)
    .trim();

  const pixData = {
    version: "01",
    key: chave,
    name: nomeFormatado,
    city: cidadeFormatada,
    message: descricao ? descricao.substring(0, 72) : undefined,
    amount: valor ? parseFloat(valor).toFixed(2) : undefined,
  };

  return encodePix(pixData);
}

router.get("/doacao", (req, res) => {
  const pixPayload = gerarPixPayload({
    chave: "31991714827",
    nome: "Luiz Ricardo de Souza Siqueira",
    cidade: "Rio Branco",
    descricao: "Pedido de Oracao",
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(pixPayload)}`;

  res.render("doacao", {
    titulo: "Apoie o Projeto",
    pixChave: "31991714827",
    pixNome: "Luiz Ricardo de Souza Siqueira",
    pixCidade: "Rio Branco",
    pixPayload,
    qrCodeUrl,
  });
});

module.exports = router;
