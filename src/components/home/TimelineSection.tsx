import {
  FlowerBouquetIcon,
  RingsFlowerIcon,
  FeastIcon,
  PoolPartyIcon,
} from "@/components/icons";

const events = [
  {
    time: "11:30",
    title: "Vi aspettiamo",
    description: "Arrivo degli ospiti e benvenuto",
    Icon: FlowerBouquetIcon,
  },
  {
    time: "12:00",
    title: "Ci sposiamo!",
    description: "La cerimonia",
    Icon: RingsFlowerIcon,
  },
  {
    time: "12:30",
    title: "Si mangia!",
    description: "Buffet e a seguire grigliatona in giardino",
    Icon: FeastIcon,
  },
  {
    time: "Pomeriggio",
    title: "Festa in piscina",
    description: "Open bar, musica e tuffi",
    Icon: PoolPartyIcon,
  },
];

export default function TimelineSection() {
  return (
    <section className="mx-auto max-w-2xl px-4">
      <h2 className="mb-12 text-center font-heading text-5xl text-marrone">
        La giornata
      </h2>

      <div className="relative border-l-2 border-verde/30 pl-8">
        {events.map((event, i) => (
          <div key={i} className="relative mb-12 last:mb-0">
            {/* Icon circle */}
            <div className="absolute -left-12 flex h-14 w-14 items-center justify-center rounded-full border-2 border-verde bg-white shadow-sm">
              <event.Icon className="h-9 w-9" />
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-beige bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-terracotta">
                {event.time}
              </p>
              <h3 className="mt-1 font-heading text-3xl text-marrone">
                {event.title}
              </h3>
              <p className="mt-2 text-grigio">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
