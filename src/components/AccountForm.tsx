"use client";

import { useEffect, useState } from "react";
import type { DesignerAccount } from "@/types/specification";
import { getAccount, saveAccount } from "@/lib/storage";

export default function AccountForm() {
  const [account, setAccount] = useState<DesignerAccount | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // localStorage is only available client-side, so account data is loaded post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccount(getAccount());
  }, []);

  if (!account) return null;

  function update<K extends keyof DesignerAccount>(key: K, value: DesignerAccount[K]) {
    setAccount((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function handleSave() {
    if (!account) return;
    saveAccount(account);
    setSaved(true);
  }

  return (
    <div className="mt-8 max-w-md space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-muted">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={account.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full border border-border px-3 py-2.5 text-sm text-accent outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={account.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full border border-border px-3 py-2.5 text-sm text-accent outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="referral" className="text-xs font-medium uppercase tracking-wide text-muted">
          Referral code
        </label>
        <input
          id="referral"
          type="text"
          value={account.referralCode}
          onChange={(e) => update("referralCode", e.target.value)}
          className="w-full border border-border px-3 py-2.5 font-mono text-sm text-accent outline-none focus:border-accent"
        />
        <p className="text-xs text-muted-soft">
          This code is embedded in every link you generate so affiliated distributors can
          attribute sales back to you.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}
