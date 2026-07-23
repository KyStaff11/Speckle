import type { Specification } from "@/types/specification";

function isBrowser() {
  return typeof window !== "undefined";
}

function specsKey(email: string): string {
  return `speckle:specifications:${email.trim().toLowerCase()}`;
}

export function getSpecifications(email: string): Specification[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(specsKey(email));
  return raw ? (JSON.parse(raw) as Specification[]) : [];
}

export function saveSpecification(email: string, spec: Specification): void {
  if (!isBrowser()) return;
  const specs = getSpecifications(email);
  window.localStorage.setItem(
    specsKey(email),
    JSON.stringify([spec, ...specs.filter((s) => s.id !== spec.id)])
  );
}

export function toggleFavourite(email: string, id: string): void {
  if (!isBrowser()) return;
  const specs = getSpecifications(email).map((s) =>
    s.id === id ? { ...s, isFavourite: !s.isFavourite } : s
  );
  window.localStorage.setItem(specsKey(email), JSON.stringify(specs));
}

export function deleteSpecification(email: string, id: string): void {
  if (!isBrowser()) return;
  const specs = getSpecifications(email).filter((s) => s.id !== id);
  window.localStorage.setItem(specsKey(email), JSON.stringify(specs));
}
