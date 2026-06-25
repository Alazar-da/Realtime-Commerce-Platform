// app/dashboard/sub-categories/components/SubCategoryTable.tsx
"use client";

import { SubCategory } from "@/types/subCategory";
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
import { Edit, Trash2, Eye, EyeOff, ImageIcon, Folder } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SubCategoryTableProps {
  subCategories: SubCategory[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function SubCategoryTable({
  subCategories,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus
}: SubCategoryTableProps) {
  const handleSelectAll = () => {
    if (selected.length === subCategories.length) {
      onSelect([]);
    } else {
      onSelect(subCategories.map(c => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter(s => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  if (subCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No sub-categories found</p>
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
                checked={selected.length === subCategories.length && subCategories.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subCategories.map((subCategory) => (
            <TableRow key={subCategory.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(subCategory.id)}
                  onCheckedChange={() => handleSelectOne(subCategory.id)}
                />
              </TableCell>
              <TableCell>
                <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {subCategory.image_url ? (
                    <Image
                      src={subCategory.image_url}
                      alt={subCategory.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{subCategory.name}</TableCell>
              <TableCell className="text-sm text-gray-500">/{subCategory.slug}</TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1">
                  <Folder className="h-3 w-3" />
                  {subCategory.category?.name || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {subCategory.description || '-'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={subCategory.status === 'active' ? 'default' : 'secondary'}
                  className={cn(
                    subCategory.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                  )}
                >
                  {subCategory.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {new Date(subCategory.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(subCategory.id)}
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