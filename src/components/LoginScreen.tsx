"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "@/lib/auth";
import { AddressFields, Field } from "@/components/FormField";
import type { Address, SignUpInput, UserRole } from "@/types/auth";

const EMPTY_ADDRESS: Address = { street: "", province: "", country: "", postalCode: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Image src="/logo.svg" alt="Speckle" width={160} height={38} priority />
        </div>

        {mode === "login" ? (
          <>
            <h1 className="text-center text-xl font-semibold text-accent">Log in to Speckle</h1>
            <div className="mt-8">
              <LoginForm />
            </div>
            <p className="mt-6 text-center text-xs text-muted">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setRole(null);
                }}
                className="font-medium text-accent underline"
              >
                Create one
              </button>
            </p>
          </>
        ) : role === null ? (
          <>
            <h1 className="text-center text-xl font-semibold text-accent">
              Are you a designer or a distributor?
            </h1>
            <p className="mt-2 text-center text-sm text-muted">
              Choose the account type that fits you — each has its own sign-up.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("designer")}
                className="border border-border p-6 text-left transition-colors hover:border-accent"
              >
                <p className="text-sm font-medium text-accent">Designer</p>
                <p className="mt-1 text-xs text-muted">
                  Specify products and earn commission on what you link.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setRole("distributor")}
                className="border border-border p-6 text-left transition-colors hover:border-accent"
              >
                <p className="text-sm font-medium text-accent">Distributor</p>
                <p className="mt-1 text-xs text-muted">
                  Get specified by designers through Speckle&apos;s affiliate program.
                </p>
              </button>
            </div>
            <p className="mt-6 text-center text-xs text-muted">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-accent underline"
              >
                Log in
              </button>
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRole(null)}
              className="mb-4 text-xs text-muted hover:text-accent"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-accent">
              {role === "designer" ? "Create your designer account" : "Create your distributor account"}
            </h1>
            <p className="mt-1 mb-6 text-sm text-muted">All fields are required.</p>
            <SignUpForm role={role} />
            <p className="mt-6 text-center text-xs text-muted">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-accent underline"
              >
                Log in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function LoginForm() {
  const { logIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await logIn(email, password);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} />
      <Field id="login-password" label="Password" type="password" value={password} onChange={setPassword} />
      {error && <p className="text-sm text-[#c0392b]">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

function SignUpForm({ role }: { role: UserRole }) {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameLabel = role === "designer" ? "First name" : "Contact first name";
  const lastNameLabel = role === "designer" ? "Last name" : "Contact last name";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = `${nameLabel} is required`;
    if (!lastName.trim()) nextErrors.lastName = `${lastNameLabel} is required`;
    if (!companyName.trim()) nextErrors.companyName = "Company name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Enter a valid email address";
    if (!address.street.trim()) nextErrors.street = "Street address is required";
    if (!address.province.trim()) nextErrors.province = "Province / State is required";
    if (!address.country.trim()) nextErrors.country = "Country is required";
    if (!address.postalCode.trim()) nextErrors.postalCode = "Postal / ZIP code is required";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords don't match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const input: SignUpInput =
        role === "designer"
          ? { role, firstName, lastName, companyName, email, address }
          : {
              role,
              companyName,
              contactFirstName: firstName,
              contactLastName: lastName,
              email,
              address,
            };
      await signUp(input, password);
    } catch (err) {
      setSubmitError(err instanceof AuthError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {role === "designer" ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field id="first-name" label={nameLabel} value={firstName} onChange={setFirstName} error={errors.firstName} />
            <Field id="last-name" label={lastNameLabel} value={lastName} onChange={setLastName} error={errors.lastName} />
          </div>
          <Field id="company-name" label="Company name" value={companyName} onChange={setCompanyName} error={errors.companyName} />
          <AddressFields
            address={address}
            onChange={(k, v) => setAddress((prev) => ({ ...prev, [k]: v }))}
            errors={errors}
          />
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} />
        </>
      ) : (
        <>
          <Field id="company-name" label="Company name" value={companyName} onChange={setCompanyName} error={errors.companyName} />
          <div className="grid grid-cols-2 gap-4">
            <Field id="first-name" label={nameLabel} value={firstName} onChange={setFirstName} error={errors.firstName} />
            <Field id="last-name" label={lastNameLabel} value={lastName} onChange={setLastName} error={errors.lastName} />
          </div>
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} />
          <AddressFields
            address={address}
            onChange={(k, v) => setAddress((prev) => ({ ...prev, [k]: v }))}
            errors={errors}
          />
        </>
      )}

      <Field id="password" label="Create a password" type="password" value={password} onChange={setPassword} error={errors.password} />
      <Field
        id="confirm-password"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={errors.confirmPassword}
      />

      {submitError && <p className="text-sm text-[#c0392b]">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
