import { Facebook, Linkedin, Twitter } from "lucide-react";

const contactInfo = [
  {
    label: "General Inquiries",
    value: "contact@finsight.example.com",
    href: "mailto:contact@finsight.example.com",
  },
  {
    label: "Support",
    value: "support@finsight.example.com",
    href: "mailto:support@finsight.example.com",
  },
  {
    label: "Phone",
    value: "+386 1 234 5678",
    href: "tel:+38612345678",
  },
  {
    label: "Address",
    value: "FinSight HQ, Trg republike 3, 1000 Ljubljana, Slovenia",
    href: "https://maps.google.com?q=FinSight+HQ,+Trg+republike+3,+1000+Ljubljana,+Slovenia",
  },
];

export default function AspectContactHero() {
  return (
    <section className="overflow-hidden bg-obsidian px-2.5 lg:px-0">
      <div className="container px-0">
        <div className="grid grid-cols-1 border-b border-l border-r border-b-dark-gray border-l-dark-gray border-r-dark-gray lg:grid-cols-2">
          <div className="items-center border-b border-b-dark-gray px-6 py-8 lg:border-b-0 lg:border-r lg:border-r-dark-gray lg:px-16 lg:py-16">
            <h2 className="text-foreground mb-2.5 text-3xl font-medium tracking-tight lg:text-4xl">
              Let’s Connect
            </h2>
            <p className="leading-relaxed text-muted-foreground lg:text-lg">
              Whether you have a question, feedback, or need support, our team
              is here to help. Drop us a line below or use any of the contact
              methods listed.
            </p>
          </div>

          <div className="bg-jet">
            <div className="px-6 py-8 lg:px-16 lg:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col gap-10">
                  {contactInfo.map(({ label, value, href }) => (
                    <div key={label}>
                      <p className="text-foreground font-semibold">{label}</p>
                      <a
                        href={href}
                        className="mt-2.5 text-sm font-medium tracking-tight text-muted-foreground hover:underline"
                      >
                        {value}
                      </a>
                    </div>
                  ))}
                </div>

                <div className="mt-10 lg:mt-0">
                  <div className="flex lg:w-full lg:items-end lg:justify-end">
                    <p className="text-foreground mb-2.5 font-semibold lg:text-right">
                      Socials
                    </p>
                  </div>
                  <div className="flex w-full items-end gap-2 lg:justify-end">
                    <a
                      href="https://facebook.com"
                      aria-label="Facebook"
                      className="text-foreground hover:text-muted-foreground"
                    >
                      <Facebook className="size-4" />
                    </a>
                    <a
                      href="https://twitter.com"
                      aria-label="Twitter"
                      className="text-foreground hover:text-muted-foreground"
                    >
                      <Twitter className="size-4" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      aria-label="LinkedIn"
                      className="text-foreground hover:text-muted-foreground"
                    >
                      <Linkedin className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
