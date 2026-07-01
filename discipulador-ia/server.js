require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const painelRoutes = require("./routes/painel");
const { exigirLogin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "discipulador-ia-troque-este-segredo",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use((req, res, next) => {
  res.locals.appName = "Discipulador.IA";
  next();
});

app.get("/", (req, res) => {
  res.redirect(req.session.usuarioId ? "/painel" : "/login");
});

app.use(authRoutes);
app.use(painelRoutes);

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`Discipulador.IA rodando na porta ${PORT}`);
});
