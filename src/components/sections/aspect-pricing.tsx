import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    features: [
      "Unlimited members",
      "2 teams",
      "500 issues",
      "Slack and Github integrations",
    ],
    cta: "Get started",
  },
  {
    name: "Startup",
    monthlyPrice: "$8",
    annualPrice: "$60",
    monthlyPerUnit: "per user/month",
    annualPerUnit: "per user/annum",
    features: [
      "All free plan features and...",
      "Aspect AI",
      "Unlimited teams",
      "Unlimited issues and file uploads",
      "Aspect Insights",
      "Admin roles",
    ],
    cta: "7 day free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "$15",
    annualPrice: "$120",
    monthlyPerUnit: "per user/month",
    annualPerUnit: "per user/annum",
    features: [
      "All free plan features and...",
      "Aspect AI",
      "Unlimited teams",
      "Unlimited issues and file uploads",
      "Aspect Insights",
      "Admin roles",
    ],
    cta: "Get started",
  },
];

export default function AspectPricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      id="aspect-faq"
      className="bg-obsidian relative overflow-hidden px-2.5 lg:px-0"
    >
      <div className="border-b-dark-gray border-l-dark-gray border-r-dark-gray container relative border-l border-r px-0">
        <div className="px-6 py-8 lg:px-8 lg:py-16">
          <div className="flex flex-col items-center gap-4 lg:gap-6">
            <h1 className="text-foreground text-3xl tracking-tight">Pricing</h1>
            <p className="text-mid-gray text-base">
              Choose the plan that fits your needs
            </p>
            <div className="flex items-center gap-2">
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                aria-label="Toggle annual vs. monthly billing"
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white [&>span]:bg-black [&>span]:data-[state=checked]:bg-black"
              />
              <span className="text-foreground text-sm font-medium">
                {isAnnual ? "Billed annually" : "Billed monthly"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t-dark-gray grid border-t sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "border-b-dark-gray relative border-b p-3 sm:border-b-0 lg:border-b-0",
                "sm:[&:nth-child(-n+2)]:border-b-dark-gray sm:[&:nth-child(-n+2)]:border-b",
                "sm:odd:border-r-dark-gray sm:odd:border-r",
                "lg:border-r-dark-gray lg:border-r lg:[&:nth-child(3n)]:border-r-0",
              )}
            >
              {plan.popular && (
                <div className="pointer-events-none absolute inset-0 z-0">
                  <img
                    src="/images/homepage/pricing/pricing-background.webp"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <Card
                className={cn(
                  "border-dark-gray h-full rounded-lg border bg-transparent",
                )}
              >
                <CardHeader>
                  <h3 className="text-foreground text-2xl font-semibold">
                    {plan.name}
                  </h3>
                  <p className="text-foreground mt-2 text-lg font-medium">
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}{" "}
                    {(plan.monthlyPerUnit || plan.annualPerUnit) &&
                      (isAnnual ? plan.annualPerUnit : plan.monthlyPerUnit)}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-col space-y-6">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-4">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-3">
                        <Check className="text-foreground size-4" />
                        <span className="text-foreground text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
