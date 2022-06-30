const jwt = require("jsonwebtoken");
const decode = require("jwt-decode");

function getTokenExpirationDate(token) {
  const decoded = decode(token);
  if (!decoded.exp) return null;

  const date = new Date(0); // The 0 here is the key, which sets the date to the epoch
  date.setUTCSeconds(decoded.exp);
  return date;
}

function isTokenExpired(token) {
  const date = getTokenExpirationDate(token);
  if (date === null) return false;

  console.log(
    "El token expira en",
    (date.valueOf() - new Date().valueOf()) / 1000,
    "segundos"
  );

  return !(date.valueOf() > new Date().valueOf());
}

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split(" ")[1];

  if (!token)
    return res
      .status(403)
      .send({ message: "Un token es requerido para la autorización." });

  try {
    if (isTokenExpired(token))
      return res.status(403).send({ message: "Token expirado." });

    const verified = jwt.verify(token, "your-256-bit-secret");
    req.user = verified;
  } catch (err) {
    return res.status(403).send({ message: "Token inválido." });
  }
  return next();
};

module.exports = verifyToken;
