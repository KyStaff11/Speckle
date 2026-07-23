import type { DesignerAccount, Specification } from "@/types/specification";

const ACCOUNT_KEY = "speckle:account";
const SPECS_KEY = "speckle:specifications";

function isBrowser() {
  return typeof window !== "undefined";
}

function randomCode(length = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Returns null if the designer hasn't created a Speckle account yet. */
export function getAccount(): DesignerAccount | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(ACCOUNT_KEY);
  return raw ? (JSON.parse(raw) as DesignerAccount) : null;
}

/** Creates the account and assigns its permanent referral code. */
export function createAccount(details: Omit<DesignerAccount, "referralCode">): DesignerAccount {
  const account: DesignerAccount = { ...details, referralCode: `DSGN-${randomCode()}` };
  if (isBrowser()) {
    window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  }
  return account;
}

export function saveAccount(account: DesignerAccount): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export function getSpecifications(): Specification[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(SPECS_KEY);
  return raw ? (JSON.parse(raw) as Specification[]) : [];
}

export function saveSpecification(spec: Specification): void {
  if (!isBrowser()) return;
  const specs = getSpecifications();
  window.localStorage.setItem(
    SPECS_KEY,
    JSON.stringify([spec, ...specs.filter((s) => s.id !== spec.id)])
  );
}

export function toggleFavourite(id: string): void {
  if (!isBrowser()) return;
  const specs = getSpecifications().map((s) =>
    s.id === id ? { ...s, isFavourite: !s.isFavourite } : s
  );
  window.localStorage.setItem(SPECS_KEY, JSON.stringify(specs));
}

export function deleteSpecification(id: string): void {
  if (!isBrowser()) return;
  const specs = getSpecifications().filter((s) => s.id !== id);
  window.localStorage.setItem(SPECS_KEY, JSON.stringify(specs));
}
