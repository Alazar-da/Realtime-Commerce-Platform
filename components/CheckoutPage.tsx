// components/CheckoutPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Order } from "@/types/order";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CheckoutPageProps {
  order: Order;
  onPaymentSuccess?: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ order, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  // Create PaymentIntent when page loads
  useEffect(() => {
    // Check if payment was already processed
    if (order.status === 'paid' || order.payment_status === 'paid') {
      setPaymentStatus('succeeded');
      return;
    }

    // Check if client secret exists in session storage
    const cachedSecret = sessionStorage.getItem(`payment_intent_${order.id}`);
    if (cachedSecret) {
      setClientSecret(cachedSecret);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: order.totalAmount, // in cents
            orderId: order.id,
            currency: "usd",
          }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setClientSecret(data.clientSecret);
        // Cache client secret
        sessionStorage.setItem(`payment_intent_${order.id}`, data.clientSecret);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to initialize payment");
        setPaymentStatus('failed');
      }
    };

    createPaymentIntent();
  }, [order]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (paymentStatus === 'succeeded') {
      window.location.href = `/payment-success?orderId=${order.id}`;
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setPaymentStatus('processing');

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage("Payment system is not ready. Please try again.");
      setLoading(false);
      setPaymentStatus('failed');
      return;
    }

    try {
      // Confirm Payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?orderId=${order.id}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      // Payment succeeded
      if (paymentIntent?.status === "succeeded") {
        setPaymentStatus('succeeded');
        
        // Update order in DB
        const response = await fetch(`/api/order/getorder?id=${order.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_status: "paid",
            payment_method: paymentIntent.payment_method_types?.[0] || "stripe",
            payment_intentid: paymentIntent.id,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update order status");
        }

        // Clear cached secret
        sessionStorage.removeItem(`payment_intent_${order.id}`);
        
        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        
        // Redirect to success page
        window.location.href = `/payment-success?orderId=${order.id}`;
      } else if (paymentIntent?.status === "requires_action") {
        // 3D Secure authentication required - handled automatically by Stripe
        toast("Additional authentication required. Please follow the prompts.");
      } else {
        setErrorMessage(`Payment status: ${paymentIntent?.status || 'Unknown'}`);
        setPaymentStatus('failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setPaymentStatus('failed');
    }

    setLoading(false);
  };

  // Show success state
  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Already Processed</h3>
        <p className="text-muted-foreground mb-4">This order has been paid for.</p>
        <button 
          onClick={() => window.location.href = `/orders/${order.id}`}
          className="text-primary hover:underline"
        >
          View Order Details →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {clientSecret ? (
        <div className="space-y-4">
          <PaymentElement />
          
          {/* Payment Status Indicator */}
          {paymentStatus === 'processing' && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing your payment...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading payment form...</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
         ): (
          `Pay $${(order.totalAmount / 100).toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Secure payment powered by Stripe. Your payment information is safe.
      </p>
    </form>
  );
};

export default CheckoutPage;