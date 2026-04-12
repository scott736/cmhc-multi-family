import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AspectFeaturedPostProps {
  tagline: string;
  header: string;
  description: string;
  image: string;
  side?: "L" | "R";
  link: string;
}

export default function AspectFeaturedPost({
  tagline,
  header,
  description,
  image,
  side = "L",
  link,
}: AspectFeaturedPostProps) {
  const order = side === "R" ? "md:flex-row-reverse" : "md:flex-row";
  const imgBorder =
    side === "R"
      ? "md:border-l md:border-l-dark-gray"
      : "md:border-r md:border-r-dark-gray";

  return (
    <section className="bg-obsidian px-2.5 lg:px-0">
      <div className="bg-jet container border border-t-0 border-dark-gray p-0">
        <div className={cn("flex flex-col md:items-stretch", order)}>
          <div
            className={cn(
              "w-full border-b border-b-dark-gray md:w-1/2 md:border-0",
              imgBorder,
            )}
          >
            <div className="relative h-full min-h-[320px]">
              <img
                src={image}
                alt={header}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          </div>

          <div className="text-foreground w-full px-6 py-12 md:w-1/2 md:px-16 md:py-20">
            <p className="text-foreground mb-4 text-sm leading-relaxed">
              {tagline}
            </p>
            <h2 className="mb-2.5 text-3xl font-medium tracking-tight md:text-4xl">
              {header}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {description}
            </p>

            <Button
              asChild
              variant="link"
              size="link"
              className="gap-1 self-start"
            >
              <a href={link}>
                Read more
                <ChevronRight className="size-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
