// app/dashboard/categories/components/CategoryCardGrid.tsx
"use client";

import { Category } from "@/types/category";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, ImageIcon, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryCardGridProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onForceDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function CategoryCardGrid({
  categories,
  onEdit,
  onDelete,
  onForceDelete,
  onToggleStatus
}: CategoryCardGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No categories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category.id} className="group hover:shadow-lg transition-shadow">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              <Badge
                variant={category.status === 'active' ? 'default' : 'secondary'}
                className={cn(
                  category.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                )}
              >
                {category.status}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold truncate">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {category.description || 'No description'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(category.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(category.id)}
                  className="h-8 w-8 text-gray-800 hover:text-gray-900 hover:bg-gray-200"
                >
                  {category.status === 'active' ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(category)}
                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onDelete(category.id)}
                      className="text-yellow-600"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Check & Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onForceDelete(category.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Force Delete (All Data)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}