// app/(customer)/checkout/page.tsx
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
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock
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
import { StripeService } from "@/services/stripeService";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface ShippingAddress {
  full_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

// Payment Form Component
function PaymentForm({ 
  onSuccess, 
  onError,
  amount,
  clientSecret,
  orderId
}: { 
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  amount: number;
  clientSecret: string;
  orderId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (paymentStatus === 'succeeded') {
      window.location.href = `/orders/${orderId}`;
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setPaymentStatus('processing');

    if (!stripe || !elements || !clientSecret) {
      const msg = "Payment system is not ready. Please try again.";
      setErrorMessage(msg);
      onError(msg);
      setLoading(false);
      setPaymentStatus('failed');
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error('Payment error:', error);
        setErrorMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setPaymentStatus('succeeded');
        onSuccess(paymentIntent.id);
      } else if (paymentIntent?.status === "requires_action") {
        // 3D Secure authentication required - handled by Stripe
        toast("Additional authentication required. Please follow the prompts.");
      } else {
        const msg = `Payment status: ${paymentIntent?.status || 'Unknown'}`;
        setErrorMessage(msg);
        onError(msg);
        setPaymentStatus('failed');
      }
    } catch (err: any) {
      console.error('Payment exception:', err);
      const msg = err.message || "Payment failed";
      setErrorMessage(msg);
      onError(msg);
      setPaymentStatus('failed');
    }

    setLoading(false);
  };

  // Show success state
  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <h4 className="font-semibold">Payment Successful!</h4>
        <p className="text-sm text-muted-foreground">Your order is being processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="p-4 border rounded-lg bg-muted/20">
        <PaymentElement />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>Your payment is secure and encrypted</span>
      </div>

      {paymentStatus === 'processing' && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Processing your payment...</span>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || loading || !clientSecret || paymentStatus === 'succeeded'}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : paymentStatus === 'succeeded' ? (
          "Paid ✓"
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🧪 Test Cards</p>
        <div className="text-xs space-y-0.5 text-blue-600 dark:text-blue-400">
          <p>✅ Success: 4242 4242 4242 4242</p>
          <p>🔒 3D Secure: 4000 0025 0000 3155</p>
          <p className="text-muted-foreground">Expiry: 12/34 • CVC: 123</p>
        </div>
      </div>
    </form>
  );
}

// Main Checkout Page
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
  const [paymentMethod, setPaymentMethod] = useState<'credit_card'>('credit_card');
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
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);

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

  const initializePayment = async () => {
    // Validate shipping address
    const requiredFields = ['full_name', 'address', 'city', 'state', 'postal_code', 'country', 'phone'];
    const missingField = requiredFields.find(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missingField) {
      toast.error(`Please fill in your ${missingField.replace('_', ' ')}`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Create order first
      const orderData: CreateOrderDTO = {
        payment_method: 'credit_card',
        shipping_address: shippingAddress,
        notes: `Payment Method: Credit Card via Stripe`
      };

      const order = await OrderService.createOrder(user.id, orderData);
      setOrderId(order.id);
      setOrderNumber(order.order_number);

      // Create payment intent
      const { clientSecret } = await StripeService.createPaymentIntent(order.total);
      setStripeClientSecret(clientSecret);
      setShowStripeForm(true);
      setError(null);
    } catch (error) {
      console.error('Error initializing payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize payment');
      toast.error('Failed to initialize payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Update payment status
      await OrderService.updatePaymentStatus(orderId, 'paid');
      await OrderService.updateOrderStatus(orderId, 'processing', 'Payment confirmed, order processing');
      
      setOrderComplete(true);
      toast.success('Order placed successfully!');
      
      // Clear payment state
      setStripeClientSecret(null);
      setShowStripeForm(false);
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error('Payment succeeded but failed to update order. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
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
                <Link href={`/orders/${orderId}`}>View Order</Link>
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
              <div className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        Credit / Debit Card
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {!showStripeForm && !submitting && (
                  <Button 
                    onClick={initializePayment}
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay with Card - ${cart.grandTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                )}

                {submitting && !showStripeForm && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Initializing payment...</span>
                  </div>
                )}

                {showStripeForm && stripeClientSecret && (
                  <Elements 
                    stripe={StripeService.getStripe()} 
                    options={{ 
                      clientSecret: stripeClientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#2563eb',
                        },
                      },
                    }}
                  >
                    <PaymentForm
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      amount={cart.grandTotal}
                      clientSecret={stripeClientSecret}
                      orderId={orderId}
                    />
                  </Elements>
                )}
              </div>
            </CardContent>
          </Card>
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

              {showStripeForm && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-4">
                  <Lock className="h-3 w-3 text-green-500" />
                  <span>Payment secured by Stripe</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}