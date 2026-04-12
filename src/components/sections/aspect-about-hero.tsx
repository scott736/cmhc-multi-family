export default function AspectAboutHero() {
  return (
    <section className="bg-obsidian overflow-hidden px-2.5 lg:px-0">
      <div className="container p-0">
        <div className="border-b-dark-gray border-l-dark-gray border-r-dark-gray flex flex-col gap-8 overflow-hidden border-l border-r px-6 py-12 md:px-16 md:py-20 md:pt-32">
          <div className="max-w-xl">
            <h1 className="text-foreground mb-2.5 text-3xl tracking-tight md:text-5xl">
              Meet the Team
            </h1>
            <p className="font-inter-tight text-mid-gray text-base">
              Behind FinSight is a small, passionate crew of fintech experts,
              engineers, and designers—united by a single goal: to bring total
              financial clarity to businesses everywhere.
            </p>
          </div>
        </div>

        <div className="border-b-dark-gray border-l-dark-gray border-r-dark-gray relative aspect-video w-full border md:aspect-[16/6]">
          <img
            src="/images/about/1.webp"
            alt="Modern workspace with an iMac displaying 'DO MORE'"
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
