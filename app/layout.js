import localFont from "next/font/local";
import "./globals.css";
import "./posterTheme.css";
import "./themes/layouts/classic.css";
import "./themes/layouts/gallery.css";
import "./themes/layouts/overlay.css";
import "./themes/layouts/editorial.css";
import "./themes/layouts/bold-block.css";
import "./themes/layouts/immersive.css";
import "./themes/layouts/retro.css";
import "./themes/layouts/decorative.css";
import "./themes/layouts/jcard.css";
import "./themes/layouts/comic.css";
import "./themes/layouts/playlist.css";
import "./themes/layouts/graduation.css";

import "./themes/layouts/receipt.css";
import "./themes/layouts/polish.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_DESCRIPTION =
  "Turn any Spotify album or song into a printable poster. 14 layout presets, custom typography and colors, and high-DPI PNG + PDF export.";

export const metadata = {
  metadataBase: new URL("https://trash-frame.vercel.app"),
  title: "TrashFrame - Album Poster Generator",
  description: SITE_DESCRIPTION,
  applicationName: "TrashFrame",
  openGraph: {
    title: "TrashFrame - Album Poster Generator",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "TrashFrame",
    type: "website",
    images: [
      {
        url: "/images/hero-posters.png",
        width: 1376,
        height: 768,
        alt: "Album posters generated with TrashFrame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrashFrame - Album Poster Generator",
    description: SITE_DESCRIPTION,
    images: ["/images/hero-posters.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
