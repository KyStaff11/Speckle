import type { SignUpInput, UserProfile } from "@/types/auth";

const USERS_KEY = "speckle:users";
const SESSION_KEY = "speckle:session";

type StoredUser = {
  profile: UserProfile;
  passwordHash: string;
  salt: string;
};

export class AuthError extends Error {}

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readUsers(): Record<string, StoredUser> {
  if (!isBrowser()) return {};
  const raw = window.localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
}

function writeUsers(users: Record<string, StoredUser>): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(email: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SESSION_KEY, email);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`));
  return toHex(digest);
}

function randomReferralCode(length = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `DSGN-${code}`;
}

export async function signUp(input: SignUpInput, password: string): Promise<UserProfile> {
  const email = normalizeEmail(input.email);
  const users = readUsers();
  if (users[email]) {
    throw new AuthError("An account with that email already exists.");
  }

  const profile: UserProfile =
    input.role === "designer"
      ? { ...input, email, referralCode: randomReferralCode() }
      : { ...input, email };

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  users[email] = { profile, passwordHash, salt };
  writeUsers(users);
  setSession(email);
  return profile;
}

export async function logIn(email: string, password: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);
  const record = readUsers()[normalized];
  if (!record) {
    throw new AuthError("No account found with that email.");
  }

  const hash = await hashPassword(password, record.salt);
  if (hash !== record.passwordHash) {
    throw new AuthError("Incorrect password.");
  }

  setSession(normalized);
  return record.profile;
}

export function logOut(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getSession(): UserProfile | null {
  if (!isBrowser()) return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return readUsers()[email]?.profile ?? null;
}

/** Updates the signed-in user's profile, re-keying the store if the email changed. */
export function updateProfile(currentEmail: string, updates: UserProfile): void {
  if (!isBrowser()) return;
  const users = readUsers();
  const key = normalizeEmail(currentEmail);
  const existing = users[key];
  if (!existing) return;

  const newKey = normalizeEmail(updates.email);
  delete users[key];
  users[newKey] = { ...existing, profile: { ...updates, email: newKey } };
  writeUsers(users);
  if (key !== newKey) setSession(newKey);
}
