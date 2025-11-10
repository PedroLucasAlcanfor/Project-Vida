const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ msg: "Token não fornecido" });
  }

  jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: "Token inválido ou expirado" });
    }
    
    req.usuario = decoded;
    next();
  });
};
