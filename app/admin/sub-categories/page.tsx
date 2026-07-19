// app/dashboard/sub-categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { SubCategoryService } from "@/services/subCategoryService";
import { CategoryService } from "@/services/categoryService";
import { SubCategory, SubCategoryFilters } from "@/types/subCategory";
import { Category } from "@/types/category";
import { Plus, Search, LayoutGrid, List, Grid3X3, Filter } from "lucide-react";
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
import { SubCategoryTable } from "@/components/admin/sub-category/SubCategoryTable";
import { SubCategoryCardGrid } from "@/components/admin/sub-category/SubCategoryCardGrid";
import { SubCategoryModal } from "@/components/admin/sub-category/SubCategoryModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [filters, setFilters] = useState<SubCategoryFilters>({
    search: '',
    category_id: undefined,
    status: 'all',
    page: 1,
    limit: 9,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
     isWarning?: boolean,
    isForceDelete?: boolean,
    onConfirm: () => void;
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
    loadSubCategories();
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
      setLoading(true);
      const response = await SubCategoryService.getSubCategories(filters);
      setSubCategories(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load sub-categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleCategoryFilter = (value: string) => {
    setFilters(prev => ({ ...prev, category_id: value === 'all' ? undefined : value, page: 1 }));
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
      await SubCategoryService.createSubCategory(data);
      toast.success('Sub-category created successfully');
      setModalOpen(false);
      loadSubCategories();
    } catch (error) {
      toast.error('Failed to create sub-category');
      console.error(error);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await SubCategoryService.updateSubCategory(id, data);
      toast.success('Sub-category updated successfully');
      setModalOpen(false);
      setEditingSubCategory(null);
      loadSubCategories();
    } catch (error) {
      toast.error('Failed to update sub-category');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
  try {
    const result = await SubCategoryService.deleteSubCategory(id);
    
    if (!result.success) {
      // Show warning dialog with related count
        setDeleteTargetId(id);
      setConfirmDialog({
        open: true,
        title: 'Cannot Delete Sub-Category',
        message: `${result.message}`,
        isWarning: true,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      });
      return;
    }

    toast.success('Sub-category deleted successfully');
    loadSubCategories();
  } catch (error) {
    toast.error('Failed to delete sub-category');
    console.error(error);
  }
};

const handleForceDelete = async (id: string) => {
  setConfirmDialog({
    open: true,
    title: '⚠️ Delete Sub-Category and All Products',
    message: 'This will permanently delete this sub-category and all associated products. This action cannot be undone.',
    isWarning: true,
    onConfirm: async () => {
      try {
        await SubCategoryService.forceDeleteSubCategory(id);
        toast.success('Sub-category and all products deleted successfully');
        loadSubCategories();
      } catch (error) {
        toast.error('Failed to delete sub-category');
        console.error(error);
      } finally {
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    }
  });
};

  const handleBulkDelete = async () => {
    if (selectedSubCategories.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Delete Sub-Categories',
      message: `Are you sure you want to delete ${selectedSubCategories.length} sub-categories? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await SubCategoryService.bulkDeleteSubCategories(selectedSubCategories);
          toast.success(`${selectedSubCategories.length} sub-categories deleted successfully`);
          setSelectedSubCategories([]);
          loadSubCategories();
        } catch (error) {
          toast.error('Failed to delete sub-categories');
          console.error(error);
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await SubCategoryService.toggleStatus(id);
      toast.success('Sub-category status updated');
      loadSubCategories();
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
          <h1 className="text-2xl font-bold">Sub-Categories</h1>
          <p className="text-sm text-gray-500">Manage your product sub-categories</p>
        </div>
        <Button onClick={() => { setEditingSubCategory(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sub-Category
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sub-categories..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filters.category_id || 'all'} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Sub-Categories Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <SubCategoryCardGrid
          subCategories={subCategories}
          onEdit={(subCategory:SubCategory) => {
            setEditingSubCategory(subCategory);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onForceDelete={handleForceDelete}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <SubCategoryTable
          subCategories={subCategories}
          selected={selectedSubCategories}
          onSelect={setSelectedSubCategories}
          onEdit={(subCategory:SubCategory) => {
            setEditingSubCategory(subCategory);
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
            Showing {subCategories.length} of {(filters.limit || 10) * totalPages} sub-categories
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
      {selectedSubCategories.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <span className="text-sm">
            {selectedSubCategories.length} selected
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
            onClick={() => setSelectedSubCategories([])}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Modals */}
      <SubCategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSubCategory(null);
        }}
        onSubmit={editingSubCategory ? 
          (data:any) => handleUpdate(editingSubCategory.id, data) :
          handleCreate
        }
        initialData={editingSubCategory || undefined}
        categories={categories}
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