import { cn } from "@/lib/utils";

interface AspectSplitSectionProps {
  header: string;
  description: string;
  image: string;
  side?: "L" | "R";
}

export default function AspectSplitSection({
  header,
  description,
  image,
  side = "L",
}: AspectSplitSectionProps) {
  const order = side === "R" ? "md:flex-row-reverse" : "md:flex-row";
  const imgBorder =
    side === "R"
      ? "md:border-l md:border-l-dark-gray"
      : "md:border-r md:border-r-dark-gray";

  return (
    <section className="bg-obsidian px-2.5 lg:px-0">
      <div className="bg-jet container border border-t-0 border-dark-gray p-0">
        <div className={cn("flex flex-col items-center", order)}>
          <div
            className={cn(
              "w-full border-b border-b-dark-gray md:w-1/2 md:border-0",
              imgBorder,
            )}
          >
            <img
              src={image}
              alt={header}
              width={800}
              height={800}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </div>

          <div className="text-foreground w-full px-6 py-12 md:w-1/2 md:px-16 md:py-20">
            <h2 className="mb-2.5 text-3xl font-medium tracking-tight md:text-4xl">
              {header}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
