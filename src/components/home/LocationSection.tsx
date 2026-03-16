export default function LocationSection() {
  return (
    <section className="mx-auto max-w-2xl px-4">
      <div className="rounded-2xl border border-beige bg-white p-10 text-center shadow-sm">
        <h2 className="font-heading text-4xl text-marrone">Luogo dell&apos;evento</h2>

        <p className="mt-4 text-lg text-grigio">
          Sia la cerimonia che la festa si terranno presso
        </p>
        <p className="mt-3 text-2xl font-semibold text-marrone">
          Ca&apos; Ross
        </p>
        <p className="text-lg text-grigio">
          Via per Sassuolo 115, Formigine (MO)
        </p>

        <a
          href="https://maps.google.com/?q=Ca'+Ross+Via+per+Sassuolo+115+Formigine"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-marrone px-8 py-3 text-bianco! hover:opacity-90"
        >
          Apri in Google Maps
        </a>
      </div>
    </section>
  );
}
