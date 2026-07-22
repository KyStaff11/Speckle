"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductDetails } from "@/types/specification";
import { buildUtmLink, slugify } from "@/lib/utm";
import { getAccount, saveSpecification } from "@/lib/storage";

const EMPTY_PRODUCT: ProductDetails = {
  sourceUrl: "",
  retailer: "",
  productName: "",
  description: "",
  imageUrl: "",
};

export default function ProductLinkForm() {
  const [projectName, setProjectName] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [product, setProduct] = useState<ProductDetails>(EMPTY_PRODUCT);
  const [status, setStatus] = useState<"idle" | "loading" | "fetched" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    // localStorage is only available client-side, so this loads post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReferralCode(getAccount().referralCode);
  }, []);

  const utmLink = useMemo(() => {
    if (!product.sourceUrl || !referralCode) return "";
    try {
      return buildUtmLink(product.sourceUrl, {
        source: "speckle",
        medium: "affiliate",
        campaign: slugify(projectName || product.productName || "specification"),
        content: referralCode,
      });
    } catch {
      return "";
    }
  }, [product.sourceUrl, projectName, product.productName, referralCode]);

  async function handleFetch() {
    if (!linkInput.trim()) return;
    setStatus("loading");
    setError(null);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch("/api/fetch-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Couldn't fetch that link");
        return;
      }

      setProduct({
        sourceUrl: data.sourceUrl,
        retailer: data.retailer ?? "",
        productName: data.productName ?? "",
        description: data.description ?? "",
        imageUrl: data.imageUrl ?? "",
      });
      setStatus("fetched");
    } catch {
      setStatus("error");
      setError("Couldn't reach that link. Check the URL and try again.");
    }
  }

  function updateProduct<K extends keyof ProductDetails>(key: K, value: ProductDetails[K]) {
    setProduct((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleCopy() {
    if (!utmLink) return;
    await navigator.clipboard.writeText(utmLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    if (!utmLink || !product.sourceUrl) return;
    saveSpecification({
      id: crypto.randomUUID(),
      projectName: projectName || product.productName || "Untitled specification",
      product,
      utmLink,
      isFavourite: false,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  const hasProduct = Boolean(product.sourceUrl);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-accent">Start a new specification</h1>
      <p className="mt-2 text-sm text-muted">
        Paste a link from one of our affiliated distributors. We&apos;ll pull the product
        details automatically and generate a tracked link you can drop straight into the spec —
        every purchase made through it is attributed back to you.
      </p>

      <div className="mt-8 space-y-2">
        <label htmlFor="project-name" className="text-sm font-medium">
          Project name
        </label>
        <input
          id="project-name"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Maple Ave Kitchen Remodel"
          className="w-full border border-border px-3 py-2.5 text-sm text-accent outline-none focus:border-accent"
        />
      </div>

      <div className="mt-6 space-y-2">
        <label htmlFor="product-link" className="text-sm font-medium">
          Affiliate product link
        </label>
        <div className="flex gap-2">
          <input
            id="product-link"
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            placeholder="https://distributor.com/product/..."
            className="flex-1 border border-border px-3 py-2.5 text-sm text-accent outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={status === "loading" || !linkInput.trim()}
            className="shrink-0 border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "Fetching…" : "Fetch details"}
          </button>
        </div>
        {status === "error" && error && <p className="text-sm text-[#c0392b]">{error}</p>}
      </div>

      {hasProduct && (
        <div className="mt-10 border border-border">
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-[160px_1fr]">
            <div className="aspect-square w-full overflow-hidden border border-border bg-[#fafafa]">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.productName || "Product"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-soft">
                  No image
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="product-name" className="text-xs font-medium uppercase tracking-wide text-muted">
                  Product name
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={product.productName}
                  onChange={(e) => updateProduct("productName", e.target.value)}
                  className="w-full border border-border px-3 py-2 text-sm text-accent outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="product-description" className="text-xs font-medium uppercase tracking-wide text-muted">
                  Description
                </label>
                <textarea
                  id="product-description"
                  value={product.description}
                  onChange={(e) => updateProduct("description", e.target.value)}
                  rows={3}
                  className="w-full resize-none border border-border px-3 py-2 text-sm text-accent outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="retailer" className="text-xs font-medium uppercase tracking-wide text-muted">
                    Retailer
                  </label>
                  <input
                    id="retailer"
                    type="text"
                    value={product.retailer}
                    onChange={(e) => updateProduct("retailer", e.target.value)}
                    className="w-full border border-border px-3 py-2 text-sm text-accent outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="image-url" className="text-xs font-medium uppercase tracking-wide text-muted">
                    Image URL
                  </label>
                  <input
                    id="image-url"
                    type="url"
                    value={product.imageUrl}
                    onChange={(e) => updateProduct("imageUrl", e.target.value)}
                    className="w-full border border-border px-3 py-2 text-sm text-accent outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-[#fafafa] p-6">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">
              Your attributed link
            </label>
            <div className="mt-2 flex gap-2">
              <input
                readOnly
                value={utmLink}
                className="flex-1 truncate border border-border bg-white px-3 py-2.5 font-mono text-xs text-accent"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 border border-border px-4 py-2.5 text-sm font-medium text-accent hover:border-accent"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-soft">
              Referral code {referralCode || "—"} · sales through this link are credited to
              your account.
            </p>

            <button
              type="button"
              onClick={handleSave}
              className="mt-5 border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {saved ? "Saved to My Projects" : "Save specification"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
