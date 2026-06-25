// app/dashboard/products/components/ProductCardGrid.tsx
"use client";

import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  ImageIcon,
  Package,
  DollarSign,
  TrendingUp
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductCardGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export function ProductCardGrid({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured
}: ProductCardGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow">
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.featured && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {product.best_seller && (
                <Badge className="bg-blue-500 hover:bg-blue-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Best Seller
                </Badge>
              )}
              {product.on_sale && (
                <Badge className="bg-red-500 hover:bg-red-600">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Sale
                </Badge>
              )}
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Badge
                variant={product.status === 'published' ? 'default' : 'secondary'}
                className={cn(
                  product.status === 'published' ? 'bg-green-500' : 'bg-gray-500'
                )}
              >
                {product.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "bg-black/50 text-white border-0",
                  product.stock_quantity <= 0 && "bg-red-500",
                  product.stock_quantity <= product.low_stock_threshold && 
                  product.stock_quantity > 0 && "bg-yellow-500"
                )}
              >
                <Package className="h-3 w-3 mr-1" />
                {product.stock_quantity}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-1">/{product.slug}</p>
                <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compare_price && (
                    <span className="text-sm text-gray-400 line-through">
                      ${product.compare_price.toFixed(2)}
                    </span>
                  )}
                </div>

                {product.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-xs text-gray-400">
                      ({product.review_count})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFeatured(product.id)}
                  className="h-8 w-8"
                >
                  {product.featured ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(product.id)}
                  className="h-8 w-8"
                >
                  {product.status === 'published' ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(product)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(product.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}