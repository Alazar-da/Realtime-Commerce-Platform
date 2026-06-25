// app/(customer)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { CustomerNavbar } from "@/components/CustomerNavbar";
import { CustomerFooter } from "@/components/CustomerFooter";
import {usePathname} from "next/navigation"; 
import { cn } from "@/lib/utils";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

 const path=pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {!path&&<CustomerNavbar />}
      <main className="flex-1">
        {children}
      </main>
     {!path&& <CustomerFooter />}
    </div>
  );
}