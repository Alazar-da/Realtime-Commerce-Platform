// app/(customer)/categories/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  ChevronRight,
  ShoppingBag,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryService } from "@/services/categoryService";
import { SubCategoryService } from "@/services/subCategoryService";
import { ProductService } from "@/services/productService";
import { Category } from "@/types/category";
import { SubCategory } from "@/types/subCategory";
import { Product } from "@/types/product";
import { toast } from "react-hot-toast";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryData();
  }, [params.slug]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const slug = params.slug as string;

      // Get category
      const categoryData = await CategoryService.getCategoryBySlug(slug);
      setCategory(categoryData);

      // Get sub-categories
      const subResponse = await SubCategoryService.getSubCategories({ 
        category_id: categoryData.id,
        limit: 100
      });
      setSubCategories(subResponse.data);

      // Get products in this category
      const productResponse = await ProductService.getCustomerProducts({
        category: slug,
        limit: 8
      });
      setProducts(productResponse.data);
    } catch (error) {
      console.error('Failed to load category:', error);
      toast.error('Category not found');
      router.push('/categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
        <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/categories" className="hover:text-primary">Categories</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-white/50" />
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-white/80 mt-2 max-w-2xl">{category.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
              <Badge className="bg-white/20 text-white border-0">
                {subCategories.length} Sub-Categories
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                {products.length} Products
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Categories */}
      {subCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sub-Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subCategories.map((sub) => (
              <Link key={sub.id} href={`/products?sub_category=${sub.slug}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="font-medium">{sub.name}</div>
                    {sub.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {sub.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Products in {category.name}</h2>
            <Button asChild variant="ghost">
              <Link href={`/products?category=${category.slug}`}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {product.on_sale && (
                      <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" className="mt-8" asChild>
        <Link href="/categories">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>
      </Button>
    </div>
  );
}