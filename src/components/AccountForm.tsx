"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AddressFields, Field } from "@/components/FormField";
import type { Address, DesignerProfile, DistributorProfile, UserProfile } from "@/types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountForm() {
  const { user, status, updateProfile } = useAuth();

  if (status === "loading") return null;

  if (!user) {
    return (
      <div className="mt-8 max-w-md border border-border bg-[#fafafa] p-6 text-sm text-muted">
        You need to log in to view your account.{" "}
        <Link href="/login" className="font-medium text-accent underline">
          Log in
        </Link>
      </div>
    );
  }

  return user.role === "designer" ? (
    <DesignerAccountForm user={user} onSave={updateProfile} />
  ) : (
    <DistributorAccountForm user={user} onSave={updateProfile} />
  );
}

function DesignerAccountForm({
  user,
  onSave,
}: {
  user: DesignerProfile;
  onSave: (profile: UserProfile) => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [companyName, setCompanyName] = useState(user.companyName);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState<Address>(user.address);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!companyName.trim()) nextErrors.companyName = "Company name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email address";
    if (!address.street.trim()) nextErrors.street = "Street address is required";
    if (!address.province.trim()) nextErrors.province = "Province / State is required";
    if (!address.country.trim()) nextErrors.country = "Country is required";
    if (!address.postalCode.trim()) nextErrors.postalCode = "Postal / ZIP code is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      role: "designer",
      firstName,
      lastName,
      companyName,
      email,
      address,
      referralCode: user.referralCode,
    });
    setSaved(true);
  }

  return (
    <div className="mt-8 max-w-md">
      <p className="mb-6 border border-border bg-[#fafafa] px-3 py-2.5 font-mono text-xs text-accent">
        Referral code {user.referralCode}
      </p>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field id="first-name" label="First name" value={firstName} onChange={(v) => { setFirstName(v); setSaved(false); }} error={errors.firstName} />
          <Field id="last-name" label="Last name" value={lastName} onChange={(v) => { setLastName(v); setSaved(false); }} error={errors.lastName} />
        </div>
        <Field id="company-name" label="Company name" value={companyName} onChange={(v) => { setCompanyName(v); setSaved(false); }} error={errors.companyName} />
        <AddressFields
          address={address}
          onChange={(k, v) => {
            setAddress((prev) => ({ ...prev, [k]: v }));
            setSaved(false);
          }}
          errors={errors}
        />
        <Field id="email" label="Email" type="email" value={email} onChange={(v) => { setEmail(v); setSaved(false); }} error={errors.email} />

        <button
          type="submit"
          className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function DistributorAccountForm({
  user,
  onSave,
}: {
  user: DistributorProfile;
  onSave: (profile: UserProfile) => void;
}) {
  const [companyName, setCompanyName] = useState(user.companyName);
  const [contactFirstName, setContactFirstName] = useState(user.contactFirstName);
  const [contactLastName, setContactLastName] = useState(user.contactLastName);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState<Address>(user.address);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!companyName.trim()) nextErrors.companyName = "Company name is required";
    if (!contactFirstName.trim()) nextErrors.firstName = "Contact first name is required";
    if (!contactLastName.trim()) nextErrors.lastName = "Contact last name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email address";
    if (!address.street.trim()) nextErrors.street = "Street address is required";
    if (!address.province.trim()) nextErrors.province = "Province / State is required";
    if (!address.country.trim()) nextErrors.country = "Country is required";
    if (!address.postalCode.trim()) nextErrors.postalCode = "Postal / ZIP code is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      role: "distributor",
      companyName,
      contactFirstName,
      contactLastName,
      email,
      address,
    });
    setSaved(true);
  }

  return (
    <div className="mt-8 max-w-md">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Field id="company-name" label="Company name" value={companyName} onChange={(v) => { setCompanyName(v); setSaved(false); }} error={errors.companyName} />
        <div className="grid grid-cols-2 gap-4">
          <Field id="first-name" label="Contact first name" value={contactFirstName} onChange={(v) => { setContactFirstName(v); setSaved(false); }} error={errors.firstName} />
          <Field id="last-name" label="Contact last name" value={contactLastName} onChange={(v) => { setContactLastName(v); setSaved(false); }} error={errors.lastName} />
        </div>
        <Field id="email" label="Email" type="email" value={email} onChange={(v) => { setEmail(v); setSaved(false); }} error={errors.email} />
        <AddressFields
          address={address}
          onChange={(k, v) => {
            setAddress((prev) => ({ ...prev, [k]: v }));
            setSaved(false);
          }}
          errors={errors}
        />

        <button
          type="submit"
          className="border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
