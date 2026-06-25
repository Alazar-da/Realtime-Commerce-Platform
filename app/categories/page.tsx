// app/(customer)/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Grid3X3, 
  Package, 
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryService } from "@/services/categoryService";
import { SubCategoryService } from "@/services/subCategoryService";
import { Category } from "@/types/category";
import { SubCategory } from "@/types/subCategory";
import { toast } from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await CategoryService.getCategories({ limit: 100 });
      setCategories(response.data);
      
      // Load sub-categories for all categories
      const subPromises = response.data.map(cat => 
        SubCategoryService.getSubCategories({ category_id: cat.id, limit: 100 })
      );
      const subResults = await Promise.all(subPromises);
      const allSubs = subResults.flatMap(res => res.data);
      setSubCategories(allSubs);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getSubCategoriesForCategory = (categoryId: string) => {
    return subCategories.filter(sc => sc.category_id === categoryId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">
          Browse products by category
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const subCats = getSubCategoriesForCategory(category.id);
          return (
            <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Grid3X3 className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0">
                  {subCats.length} Sub-Categories
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link href={`/categories/${category.slug}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Sub-Categories */}
                {subCats.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      {subCats.slice(0, 3).map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/products?sub_category=${sub.slug}`}
                          className="text-xs bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                      {subCats.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{subCats.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Button asChild className="w-full mt-4">
                  <Link href={`/products?category=${category.slug}`}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Shop {category.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
