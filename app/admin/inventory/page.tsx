// app/dashboard/inventory/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import { SubCategoryService } from "@/services/subCategoryService";
import { SaleService } from "@/services/saleService";
import { Product, ProductFilters } from "@/types/product";
import { Category } from "@/types/category";
import { SubCategory } from "@/types/subCategory";
import { 
  Package, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Edit,
  Eye,
  Plus,
  ShoppingCart,
  DollarSign,
  Calendar,
  Users,
  Receipt,
  Trash2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProductModal } from "@/components/admin/product/ProductModal";
import { SaleModal } from "@/components/admin/inventory/SaleModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: 100,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0
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
      const response = await ProductService.getProducts({
        ...filters,
        search: search || undefined,
        limit: 100
      });
      setProducts(response.data);
      setTotalPages(response.totalPages);
      
      // Update stats
      const statsData = await ProductService.getInventoryReport();
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      message: 'Are you sure you want to delete this product? This will also remove all associated sales data.',
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

  const handleSale = async (data: any) => {
    try {
      await SaleService.createSale({
        product_id: data.product_id,
        quantity: data.quantity,
        price: data.price,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        notes: data.notes
      });
      toast.success('Sale recorded successfully! Stock updated.');
      setSaleModalOpen(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      toast.error('Failed to record sale');
      console.error(error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStock = stockFilter === "all" || 
                         (stockFilter === "in_stock" && product.stock_quantity > 0) ||
                         (stockFilter === "low_stock" && product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0) ||
                         (stockFilter === "out_of_stock" && product.stock_quantity === 0);
    return matchesSearch && matchesStock;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-500', icon: XCircle };
    }
    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Low Stock', color: 'bg-yellow-500', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-500', icon: CheckCircle };
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">Track and manage your product stock</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline" onClick={loadProducts}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Stock"
          value={stats.totalStock}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={XCircle}
          color="bg-red-500"
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Product Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.stock_quantity}</span>
                          {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
                            <span className="text-xs text-yellow-500">
                              (Min: {product.low_stock_threshold})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => {
                              setSelectedProduct(product);
                              setSaleModalOpen(true);
                            }}
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span className="sr-only">Sale</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setEditingProduct(product);
                              setModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            asChild
                          >
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? 
          (data: any) => handleUpdate(editingProduct.id, data) :
          handleCreate
        }
        initialData={editingProduct || undefined}
        categories={categories}
        subCategories={subCategories}
      />

      {/* Sale Modal */}
      <SaleModal
        open={saleModalOpen}
        onClose={() => {
          setSaleModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSale}
        product={selectedProduct}
      />

      {/* Confirm Dialog */}
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