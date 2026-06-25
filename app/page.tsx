// app/(customer)/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Star, 
  ShoppingBag, 
  Truck, 
  Shield, 
  Headphones,
  TrendingUp,
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";

// Features data
const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on orders over $50",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30"
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure payment processing",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer support",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30"
  },
  {
    icon: TrendingUp,
    title: "Best Prices",
    description: "Competitive prices on all products",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30"
  }
];

// Featured categories (you can replace with actual data)
const featuredCategories = [
  { name: "Electronics", icon: "📱", count: 245, color: "from-blue-500 to-cyan-500" },
  { name: "Fashion", icon: "👕", count: 189, color: "from-pink-500 to-rose-500" },
  { name: "Home & Living", icon: "🏠", count: 156, color: "from-amber-500 to-orange-500" },
  { name: "Books", icon: "📚", count: 98, color: "from-emerald-500 to-teal-500" },
  { name: "Sports", icon: "⚽", count: 76, color: "from-red-500 to-pink-500" },
  { name: "Beauty", icon: "💄", count: 64, color: "from-violet-500 to-purple-500" },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [featured, bestSellers, onSale] = await Promise.all([
        ProductService.getFeaturedProducts(8),
        ProductService.getBestSellers(8),
        ProductService.getProductsOnSale(8)
      ]);
      setFeaturedProducts(featured);
      setBestSellers(bestSellers);
      setOnSaleProducts(onSale);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.slug}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {product.on_sale && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale!
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-xs text-muted-foreground">
                      ({product.review_count})
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-primary">
                ${product.price.toFixed(2)}
              </div>
              {product.compare_price && (
                <div className="text-xs text-muted-foreground line-through">
                  ${product.compare_price.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-primary/90 to-secondary py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-white">
              <Badge className="bg-white/20 text-white border-0 text-sm px-4 py-1.5">
                Welcome to Realtime Commerce
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Discover Amazing
                <span className="block text-yellow-300">Products Today</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Shop the latest trends with unbeatable prices. Quality products delivered to your doorstep.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Link href="/categories">
                    Browse Categories
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="relative h-64 w-full">
                {/* You can add a hero image here */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <ShoppingBag className="h-20 w-20 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Featured Products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-none hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center",
                      feature.bgColor
                    )}>
                      <Icon className={cn("h-6 w-6", feature.color)} />
                    </div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Categories</h2>
              <p className="text-muted-foreground">Shop by category</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/categories" className="gap-2">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((category) => (
              <Link key={category.name} href={`/categories/${category.name.toLowerCase()}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className={cn(
                    "p-6 text-center bg-gradient-to-br",
                    category.color
                  )}>
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-white text-sm">{category.name}</h3>
                    <p className="text-xs text-white/70">{category.count} Products</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked just for you</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products?featured=true" className="gap-2">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Best Sellers</h2>
              <p className="text-muted-foreground">Most popular products</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products?best-seller=true" className="gap-2">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* On Sale Products */}
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">On Sale</h2>
              <p className="text-muted-foreground">Great deals & discounts</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products?on-sale=true" className="gap-2">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto max-w-4xl px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers. Get the best deals on premium products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/register">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}