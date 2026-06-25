// app/(customer)/checkout/page.tsx (Updated with better error handling)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  Shield, 
  CreditCard,
  Banknote,
  Wallet,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { CartService, CartResponse } from "@/services/cartService";
import { OrderService, CreateOrderDTO } from "@/services/orderService";

interface ShippingAddress {
  full_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartResponse>({
    items: [],
    total: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    grandTotal: 0
  });
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'>('credit_card');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: ''
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndCart();
    loadSavedAddress();
  }, []);

  const fetchUserAndCart = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        router.push('/login');
        return;
      }

      const cartData = await CartService.getCart(user.id);
      setCart(cartData);

      if (cartData.items.length === 0) {
        toast.error('Your cart is empty');
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load checkout');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAddress = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profile) {
        setShippingAddress({
          full_name: profile.full_name || profile.username || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          postal_code: profile.postal_code || '',
          country: profile.country || 'United States',
          phone: profile.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading address:', error);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async () => {
    // Validate shipping address
    const requiredFields = ['full_name', 'address', 'city', 'state', 'postal_code', 'country', 'phone'];
    const missingField = requiredFields.find(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missingField) {
      toast.error(`Please fill in your ${missingField.replace('_', ' ')}`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const orderData: CreateOrderDTO = {
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        notes: `Payment Method: ${paymentMethod.replace('_', ' ').toUpperCase()}`
      };

      const order = await OrderService.createOrder(user.id, orderData);
      
      setOrderNumber(order.order_number);
      setOrderComplete(true);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.message || 'Failed to create order. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-lg font-bold text-primary">{orderNumber}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href={`/orders/${orderNumber}`}>View Order</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6 -ml-4">
        <Link href="/cart">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>
      </Button>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">Checkout</h1>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center">1</span>
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={shippingAddress.full_name}
                    onChange={handleAddressChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={handleAddressChange}
                    placeholder="10001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    placeholder="United States"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center">2</span>
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5" />
                      Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5" />
                      PayPal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5" />
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                    <Label htmlFor="cash_on_delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Package className="h-5 w-5" />
                      Cash on Delivery
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button 
            onClick={handleSubmitOrder} 
            disabled={submitting}
            size="lg"
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order - $${cart.grandTotal.toFixed(2)}`
            )}
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Preview */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${cart.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>${cart.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-500">-${cart.discount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${cart.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Free shipping over $50
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure checkout
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}