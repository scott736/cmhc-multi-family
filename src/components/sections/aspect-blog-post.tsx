"use client";

export interface AspectBlogPostProps {
  tagline: string;
  title: string;
  intro: string;
  image: string;
  author: string;
  published: string;
  link?: string;
  children: React.ReactNode;
}

export default function AspectBlogPost({
  tagline,
  title,
  intro,
  image,
  author,
  published,
  children,
}: AspectBlogPostProps) {
  return (
    <article className="bg-obsidian px-2.5 lg:px-0">
      <div className="bg-jet container border border-t-0 border-dark-gray p-0">
        <header className="flex flex-col items-center">
          <div className="text-foreground w-full px-6 py-12 md:px-16 md:py-20">
            <p className="mb-4 text-sm">{tagline}</p>
            <h1 className="mb-4 text-3xl font-medium tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mb-8 text-muted-foreground">{intro}</p>
          </div>

          <div className="w-full border-b border-t border-b-dark-gray border-t-dark-gray">
            <img
              src={image}
              alt={title}
              width={1280}
              height={720}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
          </div>

          <div className="text-foreground w-full px-6 pb-6 pt-12 md:px-16 md:pb-6 md:pt-20">
            <div className="mb-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground mb-1">
                  Written&nbsp;by:
                </strong>{" "}
                <p>{author}</p>
              </div>
              <div>
                <strong className="text-foreground mb-1">Published:</strong>{" "}
                <p>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(published))}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="prose prose-lg px-6 pb-16 [--tw-prose-body:var(--color-foreground)] [--tw-prose-bold:var(--color-foreground)] [--tw-prose-headings:var(--color-foreground)] [--tw-prose-links:var(--color-foreground)] dark:prose-invert md:px-16">
          {children}
        </section>
      </div>
    </article>
  );
}
