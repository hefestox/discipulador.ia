const express = require("express");

const router = express.Router();

function removerAcentos(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function gerarPixPayload({ chave, nome, cidade, descricao, valor }) {
  const nomeFormatado = removerAcentos(nome).substring(0, 25);
  const cidadeFormatada = removerAcentos(cidade).substring(0, 15);
  const descricaoFormatada = descricao ? removerAcentos(descricao).substring(0, 72) : "";
  const valorFormatado = valor ? parseFloat(valor).toFixed(2) : "";

  const partes = [
    "000201",
    "26",
    "0014BR.GOV.BCB.PIX",
    "01",
    chave,
    "52040000",
    "5303986",
    valorFormatado ? `54${valorFormatado.length.toString().padStart(2, "0")}${valorFormatado}` : "",
    "5802BR",
    `59${nomeFormatado.length.toString().padStart(2, "0")}${nomeFormatado}`,
    `60${cidadeFormatada.length.toString().padStart(2, "0")}${cidadeFormatada}`,
    descricaoFormatada ? `62${descricaoFormatada.length.toString().padStart(2, "0")}${descricaoFormatada}` : "",
    "6304",
  ].filter(Boolean);

  const payload = partes.join("");
  const crc = calcularCrc16(payload);
  return `${payload}${crc}`;
}

function calcularCrc16(payload) {
  let crc = 0xFFFF;
  for (const char of payload) {
    crc ^= char.charCodeAt(0);
    for (let i = 0; i < 8; i += 1) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0x8408;
      } else {
        crc >>= 1;
      }
    }
  }

  crc ^= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, "0");
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
