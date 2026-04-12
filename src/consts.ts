export const SITE_TITLE =
  "CMHC Multi-Family — The Definitive Guide to Canadian Multifamily Financing";
export const SITE_DESCRIPTION =
  "The complete resource for CMHC multi-unit residential financing: MLI Select, MLI Standard, ACLP, AHF, and CHDP. Calculators, underwriting logic, lender landscape, and developer pathways — current to April 2026.";

export const SITE_METADATA = {
  title: {
    default: SITE_TITLE,
    template: "%s | CMHC Multi-Family",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "CMHC",
    "MLI Select",
    "MLI Standard",
    "ACLP",
    "Apartment Construction Loan Program",
    "Affordable Housing Fund",
    "Canada multifamily financing",
    "multi-unit mortgage insurance",
    "CMHC calculator",
    "MLI Select point scorer",
    "loan-to-cost",
    "50-year amortization",
    "purpose-built rental",
  ],
  authors: [{ name: "CMHC Multi-Family Guide" }],
  creator: "CMHC Multi-Family Guide",
  publisher: "CMHC Multi-Family Guide",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "CMHC Multi-Family",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CMHC Multi-Family — The Definitive Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
    creator: "@cmhcmultifamily",
  },
};
