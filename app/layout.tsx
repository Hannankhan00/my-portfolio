import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});


const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.github }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: `${siteConfig.name} - Portfolio`,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Full Stack Developer Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@hannankhan",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/assets/favicon.png", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/assets/favicon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      // Core identity — used by Google to build a Knowledge Panel
      name: siteConfig.name,
      givenName: "Hannan",
      familyName: "Khan",
      nationality: "Pakistani",
      description: "Full Stack Developer from Pakistan specializing in React, Next.js, and Node.js.",
      url: siteConfig.url,
      email: siteConfig.author.email,
      jobTitle: "Full Stack Developer",
      worksFor: {
        "@type": "Organization",
        name: "Freelance",
      },
      // image must point to your actual face photo — NOT a favicon or project screenshot.
      // Add /public/assets/hannankhan.png for this to work.
      image: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/assets/hannankhan.png`,
        width: 800,
        height: 800,
        caption: "Hannan Khan — Full Stack Developer",
      },
      // sameAs: every social profile you own — Google cross-references these
      // to confirm this Person entity and build your Knowledge Panel.
      sameAs: [
        siteConfig.author.github,
        siteConfig.author.linkedin,
        siteConfig.author.instagram,
        `https://wa.me/923397197970`,
      ],
      knowsAbout: [
        "Web Development",
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "JavaScript",
        "PostgreSQL",
        "Tailwind CSS",
        "GSAP",
        "Full Stack Development",
        "UI/UX Design",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: `${siteConfig.name} Portfolio`,
      publisher: {
        "@id": `${siteConfig.url}/#person`,
      },
      description: siteConfig.description,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
      style={{
        // @ts-ignore
        '--font-display': 'var(--font-inter)',
        '--font-body': 'var(--font-inter)',
      }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* rel="me" — tells Google these profiles belong to the same person */}
        <link rel="me" href={siteConfig.author.github} />
        <link rel="me" href={siteConfig.author.linkedin} />
        <link rel="me" href={siteConfig.author.instagram} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}

