// app/(customer)/about/page.tsx
"use client";

import { 
  ShoppingBag, 
  Truck, 
  Shield, 
  Headphones, 
  Award,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Heart,
  Star,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const stats = [
    { icon: Users, value: "50K+", label: "Happy Customers" },
    { icon: ShoppingBag, value: "10K+", label: "Products Sold" },
    { icon: Award, value: "4.8★", label: "Average Rating" },
    { icon: Globe, value: "50+", label: "Countries" },
  ];

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Get your orders delivered within 2-3 business days"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "100% secure payment processing with encryption"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated customer support team always ready to help"
    },
    {
      icon: Clock,
      title: "Easy Returns",
      description: "30-day hassle-free return policy"
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "We prioritize our customers' needs and satisfaction"
    },
    {
      icon: Star,
      title: "Quality Products",
      description: "We source only the highest quality products"
    },
    {
      icon: CheckCircle,
      title: "Transparency",
      description: "We believe in honest and transparent business practices"
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "We constantly innovate to improve your shopping experience"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Realtime Commerce</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're on a mission to revolutionize online shopping by providing 
          quality products at competitive prices with exceptional customer service.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Our Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Realtime Commerce was founded in 2020 with a simple vision: to make 
              online shopping easy, affordable, and enjoyable for everyone. 
              What started as a small startup has grown into a trusted e-commerce 
              platform serving thousands of customers worldwide.
            </p>
            <p>
              We believe in the power of technology to connect people with the 
              products they love. Our platform leverages real-time data and 
              cutting-edge technology to provide a seamless shopping experience.
            </p>
            <p>
              Today, we're proud to offer a wide range of products across multiple 
              categories, all backed by our commitment to quality and customer 
              satisfaction.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-20 w-20 text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold">Built for the Future</p>
            <p className="text-muted-foreground">Real-time. Reliable. Revolutionary.</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-12 bg-muted/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">{value.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          Join thousands of satisfied customers and experience the best in 
          online shopping.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link href="/products">Shop Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}