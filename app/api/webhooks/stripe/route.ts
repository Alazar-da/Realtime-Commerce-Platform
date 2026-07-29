import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { OrderService } from "@/services/orderService";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: Request) {
    console.log("🔥 WEBHOOK HIT");
  const body = await req.text();

  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;

console.log("Event:", event.type);
console.log("PaymentIntent ID:", paymentIntent.id);
console.log("Metadata:", paymentIntent.metadata);

const orderId = paymentIntent.metadata.orderId;

console.log("Order ID:", orderId);

      await OrderService.updatePaymentStatus(orderId, "paid");

      await OrderService.updateOrderStatus(
        orderId,
        "processing",
        "Payment confirmed by Stripe"
      );

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;

      const orderId = paymentIntent.metadata.orderId;

      await OrderService.updatePaymentStatus(orderId, "failed");

      break;
    }
  }

  return NextResponse.json({ received: true });
}