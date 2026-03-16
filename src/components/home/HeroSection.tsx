import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center px-4 pt-12 text-center">
      <Image
        src="/logo.png"
        alt="Logo Marcella e Francesco"
        width={280}
        height={280}
        className="rounded-full"
        priority
      />

      <h1 className="mt-8 font-heading text-5xl text-marrone md:text-7xl">
        Marcella e Francesco
      </h1>

      <p className="mt-4 font-heading text-3xl font-bold text-marrone md:text-4xl">
        Ci sposiamo!
      </p>

      <div className="mt-8 rounded-2xl bg-marrone px-8 py-6 text-white shadow-lg">
        <p className="font-heading text-4xl md:text-5xl">29 Agosto 2026</p>
        <p className="mt-2 text-base opacity-80">
          Ca&apos; Ross · Via per Sassuolo 115, Formigine (MO)
        </p>
      </div>
    </section>
  );
}
