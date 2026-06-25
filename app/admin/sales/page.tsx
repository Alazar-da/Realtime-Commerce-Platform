// app/dashboard/sales/page.tsx
"use client";

import { useState, useEffect } from "react";
import { SaleService } from "@/services/saleService";
import { Sale } from "@/services/saleService";
import { 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  TrendingUp,
  Search,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";

export default function SalesDashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    todaySales: number;
    todayRevenue: number;
    topProducts: {
      product_name: string;
      total_sold: number;
      total_revenue: number;
    }[];
  }>({
    totalSales: 0,
    totalRevenue: 0,
    totalItems: 0,
    todaySales: 0,
    todayRevenue: 0,
    topProducts: []
  });

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const [salesData, summaryData] = await Promise.all([
        SaleService.getAllSales({ limit: 100 }),
        SaleService.getSalesSummary()
      ]);
      setSales(salesData);
      setSummary(summaryData);
    } catch (error) {
      toast.error('Failed to load sales data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track all sales transactions</p>
        </div>
        <Button variant="outline" onClick={loadSalesData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalSales}</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${summary.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.todaySales}</p>
                <p className="text-sm text-muted-foreground">Today's Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${summary.todayRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No sales recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.product?.name}</p>
                          <p className="text-xs text-muted-foreground">{sale.product?.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.quantity}</Badge>
                      </TableCell>
                      <TableCell>${sale.price.toFixed(2)}</TableCell>
                      <TableCell className="font-bold">${sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        {sale.customer_name || sale.customer_email || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}