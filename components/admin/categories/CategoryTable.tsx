// app/dashboard/categories/components/CategoryTable.tsx
"use client";

import { Category } from "@/types/category";
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
import { Edit, Trash2, Eye, EyeOff, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryTableProps {
  categories: Category[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function CategoryTable({
  categories,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus
}: CategoryTableProps) {
  const handleSelectAll = () => {
    if (selected.length === categories.length) {
      onSelect([]);
    } else {
      onSelect(categories.map(c => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter(s => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No categories found</p>
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
                checked={selected.length === categories.length && categories.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(category.id)}
                  onCheckedChange={() => handleSelectOne(category.id)}
                />
              </TableCell>
              <TableCell>
                <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="max-w-xs truncate">
                {category.description || '-'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={category.status === 'active' ? 'default' : 'secondary'}
                  className={cn(
                    category.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                  )}
                >
                  {category.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {new Date(category.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category.id)}
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