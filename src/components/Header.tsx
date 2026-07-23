import Image from "next/image";
import Link from "next/link";
import NavMenu from "@/components/NavMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center" aria-label="Speckle home">
          <Image src="/logo.svg" alt="Speckle" width={140} height={33} priority />
        </Link>
        <NavMenu />
      </div>
    </header>
  );
}
