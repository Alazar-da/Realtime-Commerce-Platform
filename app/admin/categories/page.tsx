// app/dashboard/categories/page.tsx (Updated)

"use client";

import { useState, useEffect } from "react";
import { CategoryService } from "@/services/categoryService";
import { Category, CategoryFilters } from "@/types/category";
import { Plus, Search, LayoutGrid, List, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { CategoryCardGrid } from "@/components/admin/categories/CategoryCardGrid";
import { CategoryModal } from "@/components/admin/categories/CategoryModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [filters, setFilters] = useState<CategoryFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: 9,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    isWarning?: boolean;
    isForceDelete?: boolean;
    onConfirm: () => void;
    onForceDelete?: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    isWarning: false,
    isForceDelete: false,
    onConfirm: () => {}
  });

  useEffect(() => {
    loadCategories();
  }, [filters]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await CategoryService.getCategories(filters);
      setCategories(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value as any, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = async (data: any) => {
    try {
      await CategoryService.createCategory(data);
      toast.success('Category created successfully');
      setModalOpen(false);
      loadCategories();
    } catch (error) {
      toast.error('Failed to create category');
      console.error(error);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await CategoryService.updateCategory(id, data);
      toast.success('Category updated successfully');
      setModalOpen(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      toast.error('Failed to update category');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await CategoryService.deleteCategory(id);
      
      if (!result.success) {
        // Show warning dialog with Force Delete option
        setDeleteTargetId(id);
        setConfirmDialog({
          open: true,
          title: 'Cannot Delete Category',
          message: `${result.message}`,
          isWarning: true,
          isForceDelete: true, // IMPORTANT: Set this to true to show force delete option
          onConfirm: () => {
            // User clicks "Okay, I'll handle it myself"
            setConfirmDialog(prev => ({ ...prev, open: false }));
          },
          onForceDelete: () => {
            // User clicks "Force Delete All"
            handleForceDelete(id);
          }
        });
        return;
      }

      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error(error);
    }
  };

  const handleForceDelete = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: '⚠️ Delete Category and All Related Data',
      message: 'This will permanently delete this category, all its sub-categories, and all associated products. This action cannot be undone. Are you sure you want to proceed?',
      isWarning: true,
      isForceDelete: false, // Set to false for the final confirmation
      onConfirm: async () => {
        try {
          await CategoryService.forceDeleteCategory(id);
          toast.success('Category and all related data deleted successfully');
          loadCategories();
        } catch (error) {
          toast.error('Failed to delete category');
          console.error(error);
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Delete Categories',
      message: `Are you sure you want to delete ${selectedCategories.length} categories? This action cannot be undone.`,
      isWarning: true,
      isForceDelete: false,
      onConfirm: async () => {
        try {
          await CategoryService.bulkDeleteCategories(selectedCategories);
          toast.success(`${selectedCategories.length} categories deleted successfully`);
          setSelectedCategories([]);
          loadCategories();
        } catch (error) {
          toast.error('Failed to delete categories');
          console.error(error);
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await CategoryService.toggleStatus(id);
      toast.success('Category status updated');
      loadCategories();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-gray-500">Manage your product categories</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Categories Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <CategoryCardGrid
          categories={categories}
          onEdit={(category) => {
            setEditingCategory(category);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onForceDelete={handleForceDelete}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <CategoryTable
          categories={categories}
          selected={selectedCategories}
          onSelect={setSelectedCategories}
          onEdit={(category) => {
            setEditingCategory(category);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onForceDelete={handleForceDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {categories.length} of {(filters.limit || 10) * totalPages} categories
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! - 1)}
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={filters.page === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! + 1)}
              disabled={filters.page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <span className="text-sm">
            {selectedCategories.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategories([])}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Modals */}
      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? 
          (data) => handleUpdate(editingCategory.id, data) :
          handleCreate
        }
        initialData={editingCategory || undefined}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isWarning={confirmDialog.isWarning}
        isForceDelete={confirmDialog.isForceDelete}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => {
          setConfirmDialog(prev => ({ ...prev, open: false }));
          setDeleteTargetId(null);
        }}
        onForceDelete={() => {
          if (deleteTargetId) {
            handleForceDelete(deleteTargetId);
          }
        }}
      />
    </div>
  );
}