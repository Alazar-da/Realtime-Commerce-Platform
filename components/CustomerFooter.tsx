// app/(customer)/components/CustomerFooter.tsx
"use client";

import Link from "next/link";
import {  
  Mail, 
  Phone, 
  MapPin,
  Send,
  Shield,
  Truck,
  RefreshCw,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa6";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Returns", href: "/returns" },
    { name: "Shipping", href: "/shipping" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Accessibility", href: "/accessibility" },
  ],
};

const socialLinks = [
  { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
];

export function CustomerFooter() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Subscribed to newsletter!");
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">RC</span>
              </div>
              <span className="font-bold text-lg text-white">Realtime Commerce</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Your one-stop shop for quality products at unbeatable prices. 
              Shop with confidence and enjoy a seamless shopping experience.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">
                Subscribe to our newsletter
              </h3>
              <p className="text-sm text-gray-400">
                Get the latest updates on new products and upcoming sales
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
              <Button type="submit" className="shrink-0">
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RefreshCw className="h-5 w-5 text-primary shrink-0" />
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="h-5 w-5 text-primary shrink-0" />
              <span>100% Money Back</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Realtime Commerce. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Payment Methods:</span>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-gray-800 rounded text-xs">Visa</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs">Mastercard</span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}