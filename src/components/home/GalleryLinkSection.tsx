import Link from "next/link";

export default function GalleryLinkSection() {
  return (
    <section className="mx-auto max-w-2xl px-4">
      <Link
        href="/gallery"
        className="block rounded-2xl bg-bosco p-8 text-center text-white shadow-md transition-transform hover:scale-[1.02]"
      >
        <h2 className="font-heading text-3xl">Gallery</h2>
        <p className="mt-2 opacity-80">Le foto del nostro giorno</p>
      </Link>
    </section>
  );
}
