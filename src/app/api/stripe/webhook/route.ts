import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') || '';
  
  let event: Stripe.Event;
  
  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook signature verification failed`, { status: 400 });
  }
  
  const supabase = createServerClient();
  
  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId) {
          // Update user's premium status in the database
          const { error } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: userId,
              is_premium: true,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
            
          if (error) throw error;
          
          // Add subscription record
          await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
            plan_type: session.metadata?.planType || 'monthly',
            created_at: new Date().toISOString(),
            current_period_end: null, // This would be set when we get subscription details
          });
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        
        if (userId) {
          // Update subscription status
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
            
          if (error) throw error;
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        
        if (userId) {
          // Update user's premium status
          const { error: userError } = await supabase
            .from('user_preferences')
            .update({
              is_premium: false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
            
          if (userError) throw userError;
          
          // Update subscription status
          const { error: subError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
            
          if (subError) throw subError;
        }
        
        break;
      }
      
      // Add more cases for other events you want to handle
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new NextResponse('Webhook received successfully', { status: 200 });
  } catch (error: any) {
    console.error(`Webhook handler failed: ${error.message}`);
    return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 });
  }
}