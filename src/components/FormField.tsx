import type { Address } from "@/types/auth";

export function Field({
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

export function AddressFields({
  address,
  onChange,
  errors,
}: {
  address: Address;
  onChange: <K extends keyof Address>(key: K, value: Address[K]) => void;
  errors: Partial<Record<keyof Address, string>>;
}) {
  return (
    <div className="space-y-4">
      <Field
        id="street"
        label="Street address"
        value={address.street}
        onChange={(v) => onChange("street", v)}
        error={errors.street}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          id="province"
          label="Province / State"
          value={address.province}
          onChange={(v) => onChange("province", v)}
          error={errors.province}
        />
        <Field
          id="country"
          label="Country"
          value={address.country}
          onChange={(v) => onChange("country", v)}
          error={errors.country}
        />
      </div>
      <Field
        id="postal-code"
        label="Postal / ZIP code"
        value={address.postalCode}
        onChange={(v) => onChange("postalCode", v)}
        error={errors.postalCode}
      />
    </div>
  );
}
