"use client";

import { useEffect, useState } from "react";
import type { DesignerAccount } from "@/types/specification";
import { createAccount, getAccount, saveAccount } from "@/lib/storage";

type FormFields = Omit<DesignerAccount, "referralCode">;

const EMPTY_FIELDS: FormFields = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
};

const REQUIRED_FIELDS: { key: keyof FormFields; label: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "companyName", label: "Company name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone number" },
  { key: "address", label: "Address" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: FormFields): Partial<Record<keyof FormFields, string>> {
  const errors: Partial<Record<keyof FormFields, string>> = {};

  for (const { key, label } of REQUIRED_FIELDS) {
    if (!fields[key].trim()) {
      errors[key] = `${label} is required`;
    }
  }

  if (!errors.email && !EMAIL_PATTERN.test(fields.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  return errors;
}

export default function AccountForm() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // localStorage is only available client-side, so account data is loaded post-mount.
    const existing = getAccount();
    if (existing) {
      const { referralCode: code, ...rest } = existing;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReferralCode(code);
      setFields(rest);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (referralCode) {
      saveAccount({ ...fields, referralCode });
    } else {
      const created = createAccount(fields);
      setReferralCode(created.referralCode);
    }
    setSaved(true);
  }

  const isNew = !referralCode;

  return (
    <div className="mt-8 max-w-md">
      {isNew ? (
        <p className="mb-6 text-sm text-muted">
          Create your Speckle account to start generating attributed specification links.
          All fields are required.
        </p>
      ) : (
        <p className="mb-6 border border-border bg-[#fafafa] px-3 py-2.5 font-mono text-xs text-accent">
          Referral code {referralCode}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field
            id="first-name"
            label="First name"
            value={fields.firstName}
            onChange={(v) => update("firstName", v)}
            error={errors.firstName}
          />
          <Field
            id="last-name"
            label="Last name"
            value={fields.lastName}
            onChange={(v) => update("lastName", v)}
            error={errors.lastName}
          />
        </div>

        <Field
          id="company-name"
          label="Company name"
          value={fields.companyName}
          onChange={(v) => update("companyName", v)}
          error={errors.companyName}
        />

        <Field
          id="email"
          label="Email"
          type="email"
          value={fields.email}
          onChange={(v) => update("email", v)}
          error={errors.email}
        />

        <Field
          id="phone"
          label="Phone number"
          type="tel"
          value={fields.phone}
          onChange={(v) => update("phone", v)}
          error={errors.phone}
        />

        <div className="space-y-1.5">
          <label htmlFor="address" className="text-xs font-medium uppercase tracking-wide text-muted">
            Address <span className="text-[#c0392b]">*</span>
          </label>
          <textarea
            id="address"
            value={fields.address}
            onChange={(e) => update("address", e.target.value)}
            rows={3}
            className={`w-full resize-none border px-3 py-2 text-sm text-accent outline-none focus:border-accent ${
              errors.address ? "border-[#c0392b]" : "border-border"
            }`}
          />
          {errors.address && <p className="text-xs text-[#c0392b]">{errors.address}</p>}
        </div>

        <button
          type="submit"
          className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {saved ? "Saved" : isNew ? "Create account" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted">
        {label} <span className="text-[#c0392b]">*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border px-3 py-2.5 text-sm text-accent outline-none focus:border-accent ${
          error ? "border-[#c0392b]" : "border-border"
        }`}
      />
      {error && <p className="text-xs text-[#c0392b]">{error}</p>}
    </div>
  );
}
