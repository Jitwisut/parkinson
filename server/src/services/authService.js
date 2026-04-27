const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/httpError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

async function loginUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = generateToken(user);

  // Omit password from returned user object
  const { password: _password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

async function registerUser(input) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new HttpError(400, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role,
      fcmToken: input.fcmToken ?? null,
    },
  });

  const token = generateToken(user);

  // Omit password from returned user object
  const { password: _password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
}

module.exports = { loginUser, registerUser, JWT_SECRET };
