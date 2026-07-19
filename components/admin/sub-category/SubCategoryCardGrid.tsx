// app/dashboard/sub-categories/components/SubCategoryCardGrid.tsx
"use client";

import { SubCategory } from "@/types/subCategory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, ImageIcon, Folder, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SubCategoryCardGridProps {
  subCategories: SubCategory[];
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (id: string) => void;
  onForceDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function SubCategoryCardGrid({
  subCategories,
  onEdit,
  onDelete,
  onForceDelete,
  onToggleStatus
}: SubCategoryCardGridProps) {
  if (subCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No sub-categories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subCategories.map((subCategory) => (
        <Card key={subCategory.id} className="group hover:shadow-lg transition-shadow">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
            {subCategory.image_url ? (
              <Image
                src={subCategory.image_url}
                alt={subCategory.name}
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
                variant={subCategory.status === 'active' ? 'default' : 'secondary'}
                className={cn(
                  subCategory.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                )}
              >
                {subCategory.status}
              </Badge>
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-black/50 text-white border-0">
                <Folder className="h-3 w-3 mr-1" />
                {subCategory.category?.name || 'Category'}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold truncate">{subCategory.name}</h3>
                <p className="text-xs text-gray-400 mt-1">/{subCategory.slug}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {subCategory.description || 'No description'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(subCategory.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(subCategory.id)}
                  className="h-8 w-8"
                >
                  {subCategory.status === 'active' ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(subCategory)}
                  className="h-8 w-8"
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
                      onClick={() => onDelete(subCategory.id)}
                      className="text-yellow-600"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Check & Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onForceDelete(subCategory.id)}
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