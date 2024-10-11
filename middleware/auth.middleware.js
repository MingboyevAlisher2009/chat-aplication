import { verifyToken } from "../utils/token.js";

const AuthMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const data = verifyToken(token);

  if (data instanceof Error) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = data;
  next();
};

export default AuthMiddleware;
