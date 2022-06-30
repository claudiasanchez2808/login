const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const randToken = require("rand-token");

const fs = require("./utilities");
const verifyToken = require("./middleware");

const app = express();
app.use(logger("dev"));
app.use(cors());
app.use(express.json());

const refreshTokens = [];

function createJWT(username) {
  return jwt.sign({ username }, "your-256-bit-secret", {
    expiresIn: "5s",
  });
}

app.post("/register", async (req, res) => {
  try {
    const { username } = req.body;

    // Guard required fields
    if (!username)
      return res
        .status(400)
        .send({ message: "El campo de usuario es requerido." });

    // Read the DB
    const data = await fs.readFileAsync("db.json");
    const db = JSON.parse(data);

    // Check if user already exists
    const userExists = !!db.users.filter(
      (user) => user.username === username
    )[0];
    if (userExists)
      return res.status(409).send({
        message: "Ya existe ese usuario.",
      });

    // Add new user
    db.users.push({ id: db.users.length + 1, username });
    await fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

    res.status(200).send({
      message: "Usuario registrado exitosamente",
    });
  } catch (error) {
    res.status(500).send({
      message: `Ocurrió un error: ${error}`,
    });
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { username } = req.body;

    // Guard required fields
    if (!username)
      return res
        .status(400)
        .send({ message: "El campo de usuario es requerido." });

    // Read the DB
    const data = await fs.readFileAsync("db.json");
    const db = JSON.parse(data);

    // Check if user already exists
    const user = db.users.filter((user) => user.username === username)[0];
    if (!user)
      return res.status(404).send({
        message: "El usuario no existe.",
      });

    // Create a JWT token
    const token = createJWT(user.username);

    // Crea el Refresh Token & regístralo
    const refreshToken = randToken.uid(256);
    refreshTokens[refreshToken] = user.username;

    res.status(200).send({
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/users", verifyToken, async (req, res, next) => {
  try {
    // Read the DB
    const data = await fs.readFileAsync("db.json");
    const users = JSON.parse(data).users;

    res.status(200).send(users);
  } catch (error) {
    next(error);
  }
});

app.post("/refreshToken", async (req, res) => {
  const { refreshToken } = req.body;

  // Check if refresh token is in active
  if (!(refreshToken in refreshTokens)) {
    return res.status(401).send({
      message: "Refresh Token no válido.",
    });
  }

  // Query the DB
  const username = refreshTokens[refreshToken];
  const data = await fs.readFileAsync("db.json");
  const users = JSON.parse(data).users;
  const isUserInDB = users.find((user) => user.username === username);

  // Invalidate if user not found in DB
  if (!isUserInDB)
    return res.status(401).send({
      message: "Refresh Token no válido.",
    });

  const token = createJWT(username);
  res.send({ token });
});

app.use((err, req, res, next) => {
  res.status(500).send({
    message: `An error ocurred: ${err}`,
  });
});

module.exports = app;
