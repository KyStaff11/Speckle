import ProjectList from "@/components/ProjectList";

export default function FavouritesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-accent">Favourites</h1>
      <p className="mt-2 text-sm text-muted">
        Specifications you&apos;ve starred for quick access.
      </p>
      <div className="mt-8">
        <ProjectList favouritesOnly />
      </div>
    </div>
  );
}
