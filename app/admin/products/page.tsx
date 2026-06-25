// app/dashboard/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import { SubCategoryService } from "@/services/subCategoryService";
import { Product, ProductFilters } from "@/types/product";
import { Category } from "@/types/category";
import { SubCategory } from "@/types/subCategory";
import { Plus, Search, Grid3X3, List, Filter, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { ProductTable } from "@/components/admin/product/ProductTable";
import { ProductCardGrid } from "@/components/admin/product/ProductCardGrid";
import { ProductModal } from "@/components/admin/product/ProductModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category_id: undefined,
    status: 'all',
    stock_status: 'all',
    page: 1,
    limit: 9,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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
      const response = await ProductService.getProducts(filters);
      setProducts(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load products');
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

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value as any, page: 1 }));
  };

  const handleStockFilter = (value: string) => {
    setFilters(prev => ({ ...prev, stock_status: value as any, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = async (data: any) => {
    try {
      await ProductService.createProduct(data);
      toast.success('Product created successfully');
      setModalOpen(false);
      loadProducts();
    } catch (error) {
      toast.error('Failed to create product');
      console.error(error);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await ProductService.updateProduct(id, data);
      toast.success('Product updated successfully');
      setModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await ProductService.deleteProduct(id);
          toast.success('Product deleted successfully');
          loadProducts();
        } catch (error) {
          toast.error('Failed to delete product');
          console.error(error);
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Delete Products',
      message: `Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await ProductService.bulkDeleteProducts(selectedProducts);
          toast.success(`${selectedProducts.length} products deleted successfully`);
          setSelectedProducts([]);
          loadProducts();
        } catch (error) {
          toast.error('Failed to delete products');
          console.error(error);
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await ProductService.toggleStatus(id);
      toast.success('Product status updated');
      loadProducts();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await ProductService.toggleFeatured(id);
      toast.success('Featured status updated');
      loadProducts();
    } catch (error) {
      toast.error('Failed to update featured status');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, slug, or SKU..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters && <X className="h-4 w-4" />}
              </Button>
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

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={filters.category_id || 'all'} onValueChange={handleCategoryFilter}>
                  <SelectTrigger>
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
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={filters.status} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stock</label>
                <Select value={filters.stock_status} onValueChange={handleStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="backorder">Backorder</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setFilters({
                      search: '',
                      category_id: undefined,
                      status: 'all',
                      stock_status: 'all',
                      page: 1,
                      limit: 9,
                      sortBy: 'created_at',
                      sortOrder: 'desc'
                    });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Products Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <ProductCardGrid
          products={products}
          onEdit={(product:Product) => {
            setEditingProduct(product);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onToggleFeatured={handleToggleFeatured}
        />
      ) : (
        <ProductTable
          products={products}
          selected={selectedProducts}
          onSelect={setSelectedProducts}
          onEdit={(product:Product) => {
            setEditingProduct(product);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {products.length} of {(filters.limit || 10) * totalPages} products
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
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <span className="text-sm">
            {selectedProducts.length} selected
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
            onClick={() => setSelectedProducts([])}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? 
          (data:any) => handleUpdate(editingProduct.id, data) :
          handleCreate
        }
        initialData={editingProduct || undefined}
        categories={categories}
        subCategories={subCategories}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}