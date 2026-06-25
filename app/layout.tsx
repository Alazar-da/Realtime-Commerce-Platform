// app/layout.tsx
import "./globals.css";

import { ThemeProvider } from "next-themes";
import CustomerLayout from './CustomerLayout' 


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CustomerLayout>
{children}
            </CustomerLayout>
        
        </ThemeProvider>
      </body>
    </html>
  );
}