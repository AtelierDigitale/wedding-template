export default function GiftSection() {
  return (
    <section className="mx-auto max-w-2xl px-4">
      <div className="rounded-2xl bg-terracotta p-10 text-center text-white shadow-lg">
        <p className="text-6xl">🚐</p>

        <h2 className="mt-4 font-heading text-4xl">
          Il nostro sogno a quattro ruote
        </h2>

        <p className="mt-4 text-base opacity-90">
          Se ti fa piacere puoi contribuire a rendere il nostro sogno un po&apos;
          più concreto. Qual è? Un camper per trasformarci in una famiglia a
          quattro ruote e viaggiare alla scoperta dell&apos;Europa e… perché no?
          Anche più in là! E mostrare all&apos;Angie che, tutto sommato, il mondo
          può essere anche un bel posto! Ti terremo aggiornato 😊
        </p>

        <div className="mt-6 rounded-xl bg-white/15 p-5">
          <p className="text-[10px] uppercase tracking-widest opacity-70">
            Coordinate bancarie
          </p>
          <p className="mt-2 text-lg font-semibold">
            IT13 O036 6901 6006 0507 5591 735
          </p>
          <p className="mt-1 text-lg opacity-80">
            Intestato a <span className="font-heading">Marcella e Francesco</span>
          </p>
        </div>
      </div>
    </section>
  );
}
