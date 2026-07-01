// Armazenamento simples em arquivo JSON — sem dependências nativas,
// para garantir build 100% confiável em qualquer ambiente (incluindo Railway).
// Para uso em produção com maior volume de usuários, considere migrar para
// um banco gerenciado (ex: PostgreSQL via plugin da Railway).
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "database.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ usuarios: [], jornadas: [], proximoIdUsuario: 1, proximoIdJornada: 1 }, null, 2));
}

function ler() {
  return JSON.parse(fs.readFileSync(dbFile, "utf-8"));
}

function salvar(estado) {
  fs.writeFileSync(dbFile, JSON.stringify(estado, null, 2));
}

function buscarUsuarioPorEmail(email) {
  const estado = ler();
  return estado.usuarios.find((u) => u.email === email) || null;
}

function buscarUsuarioPorId(id) {
  const estado = ler();
  return estado.usuarios.find((u) => u.id === id) || null;
}

function criarUsuario({ nome, email, senhaHash }) {
  const estado = ler();
  const usuario = {
    id: estado.proximoIdUsuario,
    nome,
    email,
    senhaHash,
    criadoEm: new Date().toISOString(),
  };
  estado.usuarios.push(usuario);
  estado.proximoIdUsuario += 1;
  salvar(estado);
  return usuario;
}

function registrarJornada({ usuarioId, sentimentoTexto, categoria, palavraMotivacional, versiculoReferencia, historiaTitulo }) {
  const estado = ler();
  const jornada = {
    id: estado.proximoIdJornada,
    usuarioId,
    sentimentoTexto,
    categoria,
    palavraMotivacional,
    versiculoReferencia,
    historiaTitulo,
    criadoEm: new Date().toISOString(),
  };
  estado.jornadas.push(jornada);
  estado.proximoIdJornada += 1;
  salvar(estado);
  return jornada;
}

module.exports = {
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
  criarUsuario,
  registrarJornada,
};
