import { Inter } from "next/font/google";
import { IBM_Plex_Mono } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: "Josh Carson \u2013 UX Designer",
  description: "UX consultation and interface design across digital projects at GearedApp.",
  openGraph: {
    title: "Josh Carson \u2013 UX Designer",
    description: "UX consultation and interface design across digital projects at GearedApp.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Josh Carson \u2013 UX Designer",
    description: "UX consultation and interface design across digital projects at GearedApp.",
    creator: "@ijcarson",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Inline script to prevent flash of wrong theme on load
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${ibmPlexMono.variable}`} style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
