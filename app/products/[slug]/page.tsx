// app/(customer)/products/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Share2, 
  Check, 
  Minus, 
  Plus,
  Truck,
  Shield,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Eye,
  Package,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductService } from "@//services/productService";
import { CategoryService } from "@/services/categoryService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AddToCartButton } from "@/components/AddToCartButton";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("description");

 /*    useEffect(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
         setUser(user); 
      };
      getUser();
    },[]) */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const slug = params.slug as string;
        
        // Get product
        const productData = await ProductService.getProductBySlug(slug);
        setProduct(productData);

        // Increment view count
        await ProductService.incrementViewCount(productData.id);

        // Get related products
        const related = await ProductService.getRelatedProducts(
          productData.id,
          productData.category_id,
          4
        );
        setRelatedProducts(related);

        // Check wishlist
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data: wishlist } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productData.id)
            .single();
          setIsInWishlist(!!wishlist);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      router.push('/login');
      return;
    }

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product!.id);
        
        if (error) throw error;
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: product!.id });
        
        if (error) throw error;
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-primary">Products</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/categories/${product.category?.slug}`} className="hover:text-primary">
          {product.category?.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-20 w-20 text-gray-400" />
              </div>
            )}
            {product.on_sale && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white">
                Sale!
              </Badge>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge className="bg-red-500 text-white text-lg px-6 py-3">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.gallery_images && product.gallery_images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div 
                className={cn(
                  "aspect-square rounded-lg overflow-hidden cursor-pointer border-2",
                  selectedImage === 0 ? "border-primary" : "border-transparent"
                )}
                onClick={() => setSelectedImage(0)}
              >
                <Image
                  src={product.image_url!}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.gallery_images.map((url, index) => (
                <div 
                  key={index}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden cursor-pointer border-2",
                    selectedImage === index + 1 ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => setSelectedImage(index + 1)}
                >
                  <Image
                    src={url}
                    alt={`${product.name} ${index + 2}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {product.category?.name}
            </Badge>
            {product.sub_category && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs">
                  {product.sub_category.name}
                </Badge>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.review_count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_price && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.compare_price.toFixed(2)}
              </span>
            )}
            {product.compare_price && (
              <Badge className="bg-green-500">
                Save ${(product.compare_price - product.price).toFixed(2)}
              </Badge>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-3 w-3 rounded-full",
              isOutOfStock ? "bg-red-500" : "bg-green-500"
            )} />
            <span className={cn(
              "font-medium",
              isOutOfStock ? "text-red-500" : "text-green-500"
            )}>
              {isOutOfStock ? "Out of Stock" : `${product.stock_quantity} in stock`}
            </span>
          </div>

          {/* Quantity & Actions */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isOutOfStock}
                className="rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock_quantity || isOutOfStock}
                className="rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <AddToCartButton 
              productId={product.id} 
              quantity={quantity}
              disabled={isOutOfStock}
              className="flex-1 min-w-[150px]"
            />

{user && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
              className={cn(
                isInWishlist && "text-red-500 border-red-500"
              )}
            >
              
              <Heart className={cn(
                "h-5 w-5",
                isInWishlist && "fill-red-500"
              )} />
            </Button>
)}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {product.description || 'No description available.'}
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Stock Status</span>
                <span className={cn(
                  "font-medium",
                  isOutOfStock ? "text-red-500" : "text-green-500"
                )}>
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">{product.rating || 'No ratings'}</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <Link key={related.id} href={`/products/${related.slug}`}>
                <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {related.image_url ? (
                      <Image
                        src={related.image_url}
                        alt={related.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {related.on_sale && (
                      <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{related.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">
                        ${related.price.toFixed(2)}
                      </span>
                      {related.compare_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${related.compare_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}