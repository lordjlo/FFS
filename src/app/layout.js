import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "FFS Kate | Fitter. Faster. Stronger.",
  description: "Personalized training and exercise form guides by FFS Kate.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
