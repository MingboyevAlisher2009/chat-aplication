import jwt from "jsonwebtoken";

export const generateToken = (email, userId) => {
  try {
    const token = jwt.sign({ email, userId }, process.env.JWT_KEY, {
      expiresIn: 30 * 24 * 60 * 60 * 1000,
    });
    return token;
  } catch (error) {
    return new Error(error);
  }
};

export const verifyToken = (token) => {
  try {
    if (!token) throw new Error("The token is invalid");

    return jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    console.error("JWT verification error:", error);
    return new Error("Invalid token");
  }
};
