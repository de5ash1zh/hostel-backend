import bcrypt from "bcryptjs";

// set salt rounds
const SALT_ROUNDS = 10;

async function hashPassword(plain) {
  if (typeof plain !== "string" || plain.trim() === "") {
    throw new Error("Password is required");
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

// compare plain vs hashed password
async function comparePassword(plain, hashed) {
  if (!hashed) return false;
  return bcrypt.compare(plain, hashed);
}

export { hashPassword, comparePassword, SALT_ROUNDS };
