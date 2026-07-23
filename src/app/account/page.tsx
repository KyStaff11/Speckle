import AccountForm from "@/components/AccountForm";

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-accent">My account</h1>
      <AccountForm />
    </div>
  );
}
