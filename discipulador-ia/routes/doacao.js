const express = require("express");

const router = express.Router();

// Gera o payload EMV/BR Code para Pix estático
function gerarPixPayload({ chave, nome, cidade, descricao, valor }) {
  function tlv(id, valor) {
    const len = String(valor.length).padStart(2, "0");
    return `${id}${len}${valor}`;
  }

  const merchantAccountInfo = tlv(
    "26",
    tlv("00", "BR.GOV.BCB.PIX") + tlv("01", chave)
  );

  const additionalData = tlv("05", descricao.substring(0, 25));
  const additionalDataField = tlv("62", additionalData);

  const nomeFormatado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 25)
    .toUpperCase();

  const cidadeFormatada = cidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 15)
    .toUpperCase();

  let payload =
    tlv("00", "01") +
    merchantAccountInfo +
    tlv("52", "0000") +
    tlv("53", "986") +
    (valor ? tlv("54", valor) : "") +
    tlv("58", "BR") +
    tlv("59", nomeFormatado) +
    tlv("60", cidadeFormatada) +
    additionalDataField +
    "6304"; // CRC placeholder

  // CRC-16/CCITT-FALSE
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  const crcHex = (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");

  return payload + crcHex;
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
