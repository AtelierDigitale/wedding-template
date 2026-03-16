import { SunFlowerIcon } from "@/components/icons";

export default function DressCodeSection() {
  return (
    <section className="mx-auto max-w-2xl px-4">
      <div className="rounded-2xl bg-bosco p-10 text-center text-white shadow-lg">
        <SunFlowerIcon className="mx-auto h-12 w-12" />

        <h2 className="mt-4 font-heading text-4xl">Cosa mi metto?</h2>

        <p className="mt-4 text-lg opacity-90">
          Rigorosamente… quello che ti pare! Tieni in considerazione che
          potrebbe esserci caldo e che sogniamo di vedervi tutti sorseggiare un
          cocktail a bordo piscina, per cui, fossi in te, porterei anche
          l&apos;occorrente per fare un tuffo!
        </p>
      </div>
    </section>
  );
}
