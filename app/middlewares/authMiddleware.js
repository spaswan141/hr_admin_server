const jwt = require("jsonwebtoken");

module.exports = {
  authenticate: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // attach user info to req
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  },
};
