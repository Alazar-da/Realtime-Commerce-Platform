// app/(customer)/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Grid3X3, 
  List, 
  SlidersHorizontal, 
  X,
  ChevronDown,
  Package,
  Star,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import { SubCategoryService } from "@/services/subCategoryService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { SubCategory } from "@/types/subCategory";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sub_category: searchParams.get('sub_category') || '',
    min_price: 0,
    max_price: 1000,
    sort: 'newest',
    page: 1,
    limit: 12
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSubCategories();
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await CategoryService.getCategories({ limit: 100 });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSubCategories = async () => {
    try {
      const response = await SubCategoryService.getSubCategories({ limit: 100 });
      setSubCategories(response.data);
    } catch (error) {
      console.error('Failed to load sub-categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getCustomerProducts({
        search: filters.search || undefined,
        category: filters.category || undefined,
        sub_category: filters.sub_category || undefined,
        min_price: filters.min_price || undefined,
        max_price: filters.max_price || undefined,
        sort: filters.sort as any,
        page: filters.page,
        limit: filters.limit
      });
      setProducts(response.data);
      setTotalPages(response.totalPages);
      setTotalProducts(response.total);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      sub_category: '',
      min_price: 0,
      max_price: 1000,
      sort: 'newest',
      page: 1,
      limit: 12
    });
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.slug}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
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
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {product.on_sale && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale!
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
              Featured
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-red-500 text-white px-4 py-2">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {product.rating > 0 && (
                  <>
                    <span className="text-sm font-medium">{product.rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      ({product.review_count})
                    </span>
                  </>
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

  const ProductListItem = ({ product }: { product: Product }) => (
    <Link href={`/products/${product.slug}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="relative w-full sm:w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
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
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {product.category?.name}
                  </Badge>
                  {product.sub_category && (
                    <Badge variant="outline" className="text-xs">
                      {product.sub_category.name}
                    </Badge>
                  )}
                </div>
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm font-medium">{product.rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-muted-foreground">
                      ({product.review_count} reviews)
                    </span>
                  </div>
                )}
                {product.short_description && (
                  <p className="text-muted-foreground mt-2 line-clamp-2">
                    {product.short_description}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </div>
                {product.compare_price && (
                  <div className="text-sm text-muted-foreground line-through">
                    ${product.compare_price.toFixed(2)}
                  </div>
                )}
                <Badge className={cn(
                  "mt-2",
                  product.stock_quantity === 0 ? "bg-red-500" : "bg-green-500"
                )}>
                  {product.stock_quantity === 0 ? "Out of Stock" : "In Stock"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );

  // Filter Sidebar Content
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="text-primary"
        >
          Clear all filters
        </Button>
      </div>

      <Accordion type="single" collapsible defaultValue="category">
        <AccordionItem value="category">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={!filters.category}
                  onCheckedChange={() => handleFilterChange('category', '')}
                />
                All Categories
              </Label>
              {categories.map((category) => (
                <Label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.category === category.slug}
                    onCheckedChange={() => handleFilterChange('category', category.slug)}
                  />
                  {category.name}
                </Label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sub_category">
          <AccordionTrigger>Sub-Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={!filters.sub_category}
                  onCheckedChange={() => handleFilterChange('sub_category', '')}
                />
                All Sub-Categories
              </Label>
              {subCategories
                .filter(sc => !filters.category || sc.category?.slug === filters.category)
                .map((subCategory) => (
                  <Label key={subCategory.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.sub_category === subCategory.slug}
                      onCheckedChange={() => handleFilterChange('sub_category', subCategory.slug)}
                    />
                    {subCategory.name}
                  </Label>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[filters.min_price, filters.max_price]}
                onValueChange={([min, max]:[min:number,max:number]) => {
                  handleFilterChange('min_price', min);
                  handleFilterChange('max_price', max);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.min_price}</span>
                <span>${filters.max_price}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-muted-foreground">
          {totalProducts} products available
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-4"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {/* Mobile Filter Button */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                const isCurrent = filters.page === page;
                return (
                  <Button
                    key={page}
                    variant={isCurrent ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={isCurrent ? 'bg-primary' : ''}
                  >
                    {page}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}