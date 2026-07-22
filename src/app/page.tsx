import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-soft">
        For kitchen &amp; design specifiers
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight text-accent sm:text-5xl">
        Get credit for the legwork behind every spec.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
        Speckle turns the products you already specify into trackable affiliate links.
        Paste a product link from an affiliated distributor, we&apos;ll pull the details,
        and you get a unique link that credits every sale back to you.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/specify"
          className="border border-accent bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Start a new specification
        </Link>
        <Link
          href="/projects"
          className="border border-border px-6 py-3 text-sm font-medium text-accent hover:border-accent"
        >
          View my projects
        </Link>
      </div>

      <dl className="mt-20 grid grid-cols-1 gap-8 border-t border-border pt-10 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-soft">01</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted">
            Paste a product link from an affiliated distributor.
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-soft">02</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted">
            We pull the product name, description and photo — edit anything.
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-soft">03</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted">
            Share your unique link. Every purchase is attributed back to you.
          </dd>
        </div>
      </dl>
    </div>
  );
}
