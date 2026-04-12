import type { CollectionEntry } from "astro:content";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogEntry = CollectionEntry<"blog">;
type Props = { posts: BlogEntry[] };

export default function AspectPostGrid({ posts }: Props) {
  return (
    <section className="overflow-hidden bg-obsidian px-2.5 lg:px-0">
      <div className="container relative border border-b border-t-0 border-dark-gray px-0">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => {
            const date = post.data.published;
            const dateLabel = date
              ? date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "";
            const tagline =
              post.data.tagline ??
              (post.data.tags?.length
                ? `${post.data.tags[0]} · ${dateLabel}`
                : dateLabel);

            return (
              <div
                key={post.id ?? i}
                className={cn(
                  "relative",
                  "border-b border-b-dark-gray last:border-b-0",
                  "sm:border-b-0",
                  "sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(-n+2)]:border-b-dark-gray",
                  "sm:odd:border-r sm:odd:border-r-dark-gray",
                  "lg:!border-b-0",
                  "lg:border-r lg:border-r-dark-gray",
                  "lg:[&:nth-child(3n)]:border-r-0",
                  "lg:last:!border-r-0",
                )}
              >
                <div className="flex flex-col">
                  <div className="relative aspect-square w-full overflow-hidden rounded-sm border-b border-b-dark-gray">
                    <a href={`/blog/${post.id}`}>
                      <img
                        src={
                          post.data.coverImage ??
                          post.data.image ??
                          "/images/blog/placeholder.webp"
                        }
                        alt={post.data.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 px-6 py-12">
                    <p className="text-foreground text-sm">{tagline}</p>
                    <h3 className="text-foreground text-xl font-medium">
                      {post.data.title}
                    </h3>
                    {post.data.intro && (
                      <p className="text-mid-gray">{post.data.intro}</p>
                    )}

                    <Button
                      asChild
                      variant="link"
                      size="link"
                      className="gap-1 self-start"
                    >
                      <a href={`/blog/${post.id}`}>
                        Read more <ChevronRight className="size-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
