import { Button } from "@/components/ui/button";

const AspectHero = () => (
  <section
    id="aspect-hero"
    className="relative overflow-hidden bg-obsidian px-2.5 lg:px-0"
  >
    <div className="container relative border-l border-r border-l-dark-gray border-r-dark-gray px-5">
      <div className="pointer-events-none absolute inset-0 flex size-full items-center justify-center">
        <img
          src="/images/homepage/hero-background.webp"
          alt="Hero background"
          className="size-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="grid gap-12 py-12 lg:grid-cols-[1fr_auto] lg:py-20 lg:pl-12">
        <div className="flex flex-col items-start justify-center gap-5 lg:gap-8">
          <h1 className="text-foreground text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            All Your Financial Accounts in One Unified Dashboard
          </h1>

          <p className="font-inter-tight text-mid-gray text-base md:text-lg lg:text-xl">
            Aggregate every bank, subsidiary, and currency in real time. Monitor
            balances, track cash flow, and gain actionable insights—all without
            juggling multiple logins.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href="/pricing" aria-label="Try for free">
                Try for free
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="/pricing" aria-label="Book a demo">
                Book a demo
              </a>
            </Button>
          </div>
        </div>
        <div className="bg-overlay-gray inline-block w-full rounded-md p-3 sm:p-4 lg:w-[522px] lg:rounded-md">
          <div className="relative aspect-[522/572] w-full overflow-hidden rounded-md">
            <img
              src="/images/homepage/aspect-hero-image.webp"
              alt="Aspect product interface showing connected banks"
              className="absolute inset-0 h-full w-full object-cover object-left-top"
              loading="lazy"
              width={522}
              height={572}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AspectHero;
