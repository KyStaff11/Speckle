import ProjectList from "@/components/ProjectList";

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-accent">My Projects</h1>
      <p className="mt-2 text-sm text-muted">
        Every specification you&apos;ve saved, with its attributed link.
      </p>
      <div className="mt-8">
        <ProjectList />
      </div>
    </div>
  );
}
