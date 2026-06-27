const jwt = require("jsonwebtoken");
const { collections } = require("../config/db");

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  });
}

function verifyRole(...roles) {
  return async (req, res, next) => {
    const user = await collections.users.findOne({ email: req.user.email });
    if (!user || !roles.includes(user.role)) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.role = user.role;
    next();
  };
}

module.exports = { verifyToken, verifyRole };
