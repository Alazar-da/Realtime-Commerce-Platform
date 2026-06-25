// components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { CartService } from "@/services/cartService";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function AddToCartButton({ 
  productId, 
  quantity = 1,
  variant = 'default',
  size = 'default',
  className,
  disabled = false
}: AddToCartButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      await CartService.addToCart(user.id, productId, quantity);
      setIsAdded(true);
      toast.success('Added to cart!');
      setTimeout(() => {
        setIsAdded(false)
 router.push('/cart')
      }, 2000);
     
      
      // Refresh cart count
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isLoading || isAdded}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-300",
        isAdded && "bg-green-500 hover:bg-green-600",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}