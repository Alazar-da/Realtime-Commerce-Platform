// app/dashboard/products/components/ProductTable.tsx
"use client";

import { Product } from "@/types/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  Package
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export function ProductTable({
  products,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured
}: ProductTableProps) {
  const handleSelectAll = () => {
    if (selected.length === products.length) {
      onSelect([]);
    } else {
      onSelect(products.map(p => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter(s => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  const getStockBadge = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return <Badge className="bg-red-500">Out of Stock</Badge>;
    }
    if (product.stock_quantity <= product.low_stock_threshold) {
      return <Badge className="bg-yellow-500">Low Stock</Badge>;
    }
    return <Badge className="bg-green-500">In Stock</Badge>;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selected.length === products.length && products.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(product.id)}
                  onCheckedChange={() => handleSelectOne(product.id)}
                />
              </TableCell>
              <TableCell>
                <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium truncate max-w-[150px]">{product.name}</div>
                <div className="text-xs text-gray-400 truncate max-w-[150px]">/{product.slug}</div>
              </TableCell>
              <TableCell className="text-sm">{product.sku}</TableCell>
              <TableCell>
                <div className="font-semibold">${product.price.toFixed(2)}</div>
                {product.compare_price && (
                  <div className="text-xs text-gray-400 line-through">
                    ${product.compare_price.toFixed(2)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{product.stock_quantity}</span>
                </div>
                {getStockBadge(product)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={product.status === 'published' ? 'default' : 'secondary'}
                  className={cn(
                    product.status === 'published' ? 'bg-green-500' : 'bg-gray-500'
                  )}
                >
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFeatured(product.id)}
                  className="px-2"
                >
                  {product.featured ? (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                {product.rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-xs text-gray-400">({product.review_count})</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}