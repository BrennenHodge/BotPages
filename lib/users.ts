import bcrypt from "bcryptjs";
import { execute, queryOne } from "./db";
import { makeId, nowIso } from "./ids";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getUserByEmail(email: string) {
  return queryOne<UserRow>("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
}

export async function getUserById(id: string) {
  return queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
}

export async function createUser(email: string, password: string) {
  const id = makeId("usr");
  const created_at = nowIso();
  await execute("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)", [
    id,
    email.toLowerCase(),
    await hashPassword(password),
    created_at,
  ]);
  return { id, email: email.toLowerCase(), created_at };
}

export async function updatePassword(userId: string, password: string) {
  await execute("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(password), userId]);
}
