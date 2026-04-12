export default function AspectSupportHero() {
  return (
    <section
      id="aspect-hero"
      className="bg-obsidian relative overflow-hidden px-2.5 lg:px-0"
    >
      <div className="border-b-dark-gray border-l-dark-gray border-r-dark-gray container relative border-b border-l border-r px-5">
        <div className="grid gap-12 py-12 lg:grid-cols-[1fr_auto] lg:py-20 lg:pl-12">
          <div className="flex flex-col items-start justify-center gap-5 lg:gap-8">
            <h1 className="text-foreground text-balance text-2xl tracking-tight md:text-4xl lg:text-5xl">
              Real‑Time In‑App Messaging Support
            </h1>

            <p className="text-mid-gray max-w-lg text-base">
              Get answers without breaking your flow. Our built‑in chat connects
              you directly to FinSight specialists who can troubleshoot issues,
              guide new workflows, and share best‑practice tips—all from inside
              the dashboard and typically within minutes.
            </p>
          </div>

          <div className="bg-overlay-gray rounded-sm p-2 sm:p-3 md:p-4 lg:rounded-md">
            <div className="relative aspect-[522/572] size-full overflow-hidden rounded-sm lg:min-h-[572px] lg:min-w-[522px] lg:rounded-md">
              <img
                src="/images/homepage/features-tabs/5.webp"
                alt="FinSight in‑app chat showing a support conversation"
                className="absolute inset-0 size-full object-cover object-left-top"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
