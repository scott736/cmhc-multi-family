import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function parseISO(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function today(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

export default function CoIExpiry() {
  const [coiIssue, setCoiIssue] = useState<string>(formatDate(today()));
  const [coiValidityMonths, setCoiValidityMonths] = useState<number>(3);
  const [hasRateLock, setHasRateLock] = useState<boolean>(false);
  const [rateLockDate, setRateLockDate] = useState<string>(formatDate(today()));
  const [rateLockValidityDays, setRateLockValidityDays] = useState<number>(90);

  const now = today();

  const coiInfo = useMemo(() => {
    const issued = parseISO(coiIssue);
    if (!issued) return null;
    const expiry = addMonths(issued, Math.max(0, coiValidityMonths));
    const totalDays = Math.max(1, daysBetween(issued, expiry));
    const elapsedDays = Math.max(0, daysBetween(issued, now));
    const remainingDays = daysBetween(now, expiry);
    const pctElapsed = Math.min(100, (elapsedDays / totalDays) * 100);
    return {
      issued,
      expiry,
      totalDays,
      elapsedDays,
      remainingDays,
      pctElapsed,
    };
  }, [coiIssue, coiValidityMonths, now]);

  const rateLockInfo = useMemo(() => {
    if (!hasRateLock) return null;
    const locked = parseISO(rateLockDate);
    if (!locked) return null;
    const expiry = addDays(locked, Math.max(0, rateLockValidityDays));
    const totalDays = Math.max(1, daysBetween(locked, expiry));
    const elapsedDays = Math.max(0, daysBetween(locked, now));
    const remainingDays = daysBetween(now, expiry);
    const pctElapsed = Math.min(100, (elapsedDays / totalDays) * 100);
    return {
      locked,
      expiry,
      totalDays,
      elapsedDays,
      remainingDays,
      pctElapsed,
    };
  }, [hasRateLock, rateLockDate, rateLockValidityDays, now]);

  function statusColor(remaining: number): string {
    if (remaining < 0) return "text-mid-gray";
    if (remaining <= 14) return "text-star";
    return "text-foreground";
  }

  return (
    <div className="bg-obsidian text-foreground">
      {/* HEADER */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            CoI & Rate-Lock Expiry
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Track CoI and rate-lock runway.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            CMHC Certificates of Insurance carry a finite validity window —
            typically 3 months, extendable. Rate-lock windows commonly run
            60–120 days. This tool surfaces days remaining, the expiry date,
            and the key September 3, 2025 CoI transfer restriction.
          </p>
        </div>
      </section>

      {/* POLICY CALLOUT */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-8 lg:px-12 lg:py-10">
          <Card className="bg-jet border-star/40 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-star/40 text-star">
                September 3, 2025 policy
              </Badge>
              <div className="text-sm font-semibold">End of CoI shopping</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              CoI transfer between lenders is now restricted. Approved lenders
              must fund at least 80% of approved loans. Borrowers can no longer
              shop a CoI among multiple lenders for the best rate at funding —
              the lender selection decision must be made before CMHC
              submission. If your CoI approaches expiry with the original
              lender, work that relationship first; transfer is not a reliable
              fallback.
            </p>
          </Card>
        </div>
      </section>

      {/* INPUTS + STATUS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-10 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            {/* CoI inputs + status */}
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Certificate of Insurance
              </div>
              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="coi-issue" className="text-xs text-muted-foreground">
                    CoI issue date
                  </Label>
                  <Input
                    id="coi-issue"
                    type="date"
                    value={coiIssue}
                    onChange={(e) => setCoiIssue(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="coi-validity" className="text-xs text-muted-foreground">
                    CoI validity (months)
                  </Label>
                  <Input
                    id="coi-validity"
                    type="number"
                    min={1}
                    max={12}
                    value={coiValidityMonths}
                    onChange={(e) => setCoiValidityMonths(Number(e.target.value))}
                  />
                </div>
              </div>

              {coiInfo && (
                <div className="mt-6 rounded border border-dark-gray bg-obsidian p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`font-semibold ${statusColor(coiInfo.remainingDays)}`}
                    >
                      {coiInfo.remainingDays < 0
                        ? `Expired ${Math.abs(coiInfo.remainingDays)}d ago`
                        : `${coiInfo.remainingDays} days remaining`}
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded bg-jet">
                    <div
                      className="h-2 rounded bg-star transition-all"
                      style={{ width: `${coiInfo.pctElapsed}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Expiry</div>
                      <div className="font-mono">{formatDate(coiInfo.expiry)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total window</div>
                      <div>{coiInfo.totalDays} days</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Rate lock */}
            <Card className="bg-jet border-dark-gray p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Rate lock (optional)
                </div>
                <Switch checked={hasRateLock} onCheckedChange={setHasRateLock} />
              </div>
              {hasRateLock ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label htmlFor="rl-date" className="text-xs text-muted-foreground">
                        Rate lock date
                      </Label>
                      <Input
                        id="rl-date"
                        type="date"
                        value={rateLockDate}
                        onChange={(e) => setRateLockDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rl-validity" className="text-xs text-muted-foreground">
                        Lock validity (days)
                      </Label>
                      <Input
                        id="rl-validity"
                        type="number"
                        min={1}
                        max={365}
                        value={rateLockValidityDays}
                        onChange={(e) => setRateLockValidityDays(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {rateLockInfo && (
                    <div className="mt-6 rounded border border-dark-gray bg-obsidian p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span
                          className={`font-semibold ${statusColor(rateLockInfo.remainingDays)}`}
                        >
                          {rateLockInfo.remainingDays < 0
                            ? `Expired ${Math.abs(rateLockInfo.remainingDays)}d ago`
                            : `${rateLockInfo.remainingDays} days remaining`}
                        </span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded bg-jet">
                        <div
                          className="h-2 rounded bg-star transition-all"
                          style={{ width: `${rateLockInfo.pctElapsed}%` }}
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-muted-foreground">Expiry</div>
                          <div className="font-mono">
                            {formatDate(rateLockInfo.expiry)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Window</div>
                          <div>{rateLockInfo.totalDays} days</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Toggle on to track a rate lock alongside the CoI.
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* RENEWAL OPTIONS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-10 lg:px-12 lg:py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              Near expiry
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              Renewal options.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Approach the expiry date proactively. Extensions and
              re-approvals are discretionary — build in at least 30 days
              of buffer.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-sm font-semibold">CoI extension</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Request via the approved lender through MULTI-GO. Typical
                extensions are granted in 1–3 month blocks on material
                progress toward funding.
              </p>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-sm font-semibold">Re-approval</div>
              <p className="mt-2 text-xs text-muted-foreground">
                If the CoI has expired, a new application may be required —
                with a fresh appraisal and updated financials. Re-approval
                can be materially faster than a net-new deal if the file is
                current.
              </p>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-sm font-semibold">Rate-lock extension</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Lender discretion; may carry a fee or require top-up to
                current pricing. Coordinate lock and CoI expiries to avoid
                one trailing the other.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
