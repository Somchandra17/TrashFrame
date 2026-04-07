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
import "./themes/layouts/8bit.css";
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

export const metadata = {
  title: "TrashFrame - Album Poster Generator",
  description: "Turn any Spotify album into a printable poster",
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
