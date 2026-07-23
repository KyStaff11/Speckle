"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Specification } from "@/types/specification";
import { deleteSpecification, getSpecifications, toggleFavourite } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

export default function ProjectList({ favouritesOnly = false }: { favouritesOnly?: boolean }) {
  const { user, status } = useAuth();
  const [specs, setSpecs] = useState<Specification[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // localStorage is only available client-side, so specs load post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpecs(getSpecifications(user.email));
  }, [user]);

  function refresh() {
    if (user) setSpecs(getSpecifications(user.email));
  }

  async function handleCopy(spec: Specification) {
    await navigator.clipboard.writeText(spec.utmLink);
    setCopiedId(spec.id);
    setTimeout(() => setCopiedId((id) => (id === spec.id ? null : id)), 2000);
  }

  if (status === "loading") return null;

  if (!user) {
    return (
      <p className="text-sm text-muted">
        You need to{" "}
        <Link href="/login" className="font-medium text-accent underline">
          log in
        </Link>{" "}
        to see this.
      </p>
    );
  }

  if (specs === null) return null;

  const visible = favouritesOnly ? specs.filter((s) => s.isFavourite) : specs;

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted">
        {favouritesOnly
          ? "You haven't favourited any specifications yet."
          : "No specifications yet — start a new one to see it here."}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border border border-border">
      {visible.map((spec) => (
        <li key={spec.id} className="flex gap-4 p-5">
          <div className="h-16 w-16 shrink-0 overflow-hidden border border-border bg-[#fafafa]">
            {spec.product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={spec.product.imageUrl}
                alt={spec.product.productName}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-accent">{spec.projectName}</p>
                <p className="truncate text-xs text-muted">
                  {spec.product.productName || "Untitled product"} · {spec.product.retailer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!user) return;
                  toggleFavourite(user.email, spec.id);
                  refresh();
                }}
                aria-label={spec.isFavourite ? "Remove from favourites" : "Add to favourites"}
                className={`shrink-0 border px-2.5 py-1 text-xs font-medium ${
                  spec.isFavourite
                    ? "border-accent text-accent"
                    : "border-border text-muted-soft hover:text-accent"
                }`}
              >
                {spec.isFavourite ? "★ Favourited" : "☆ Favourite"}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                readOnly
                value={spec.utmLink}
                className="min-w-0 flex-1 truncate border border-border bg-[#fafafa] px-2.5 py-1.5 font-mono text-xs text-accent"
              />
              <button
                type="button"
                onClick={() => handleCopy(spec)}
                className="shrink-0 border border-border px-3 py-1.5 text-xs font-medium text-accent hover:border-accent"
              >
                {copiedId === spec.id ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!user) return;
                  deleteSpecification(user.email, spec.id);
                  refresh();
                }}
                className="shrink-0 border border-border px-3 py-1.5 text-xs font-medium text-muted-soft hover:border-[#c0392b] hover:text-[#c0392b]"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
