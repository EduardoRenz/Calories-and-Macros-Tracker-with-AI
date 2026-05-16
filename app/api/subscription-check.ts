import { NextResponse } from "next/server"
import { verifyAuth } from "./auth-middleware"
import { BILLING_CONSTANTS } from "@/domain/constants/billing"
import { getSupabaseAdminClient } from "@/data/supabaseServer"
import { env } from "@/env"

const USE_MOCKS = env.NEXT_PUBLIC_BACKEND_PROVIDER === "mock"

/**
 * Checks if the user has premium access (either paid subscription or active trial).
 * Returns a 403 response if the user doesn't have premium access.
 * Returns null if the request is allowed to proceed.
 */
export async function checkPremiumAccess(authHeader: string | null): Promise<NextResponse | null> {
  try {
    const user = await verifyAuth(authHeader)

    if (USE_MOCKS) {
      console.log("[SubscriptionCheck] Mock mode: allowing premium access")
      return null
    }

    if (env.NEXT_PUBLIC_BACKEND_PROVIDER === "supabase") {
      const supabase = getSupabaseAdminClient()

      // Check if user has an active premium subscription
      const { data: subscription, error } = await supabase
        .from("billing_subscriptions")
        .select("*, billing_plans(plan_code)")
        .eq("user_id", user.uid)
        .eq("access_status", "premium")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && subscription && subscription.access_status === "premium") {
        // Fallback: check if subscription period has expired
        // NULL current_period_end means infinite/lifetime access (e.g., admin plans)
        const now = new Date()
        const periodEndStr = subscription.current_period_end

        if (periodEndStr === null || (!isNaN(new Date(periodEndStr).getTime()) && now <= new Date(periodEndStr))) {
          console.log("[SubscriptionCheck] User has active premium subscription")
          return null
        }

        console.warn(`[SubscriptionCheck] Subscription period expired: ${subscription.id}`)
        // Continue to deny access
      }

      // Check if user is in trial period
      const { data: authUser } = await supabase.auth.admin.getUserById(user.uid)

      if (authUser.user?.created_at) {
        const createdAt = new Date(authUser.user.created_at)
        const now = new Date()
        const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

        if (daysSinceCreation < BILLING_CONSTANTS.TRIAL_DAYS) {
          console.log("[SubscriptionCheck] User is in trial period")
          return null
        }
      }

      console.warn("[SubscriptionCheck] User does not have premium access")
      return NextResponse.json({ error: "Premium subscription required. Please upgrade to access this feature." }, { status: 403 })
    }

    // For Firebase, check user metadata creation time
    // Note: This would require Firebase Admin SDK initialization
    // For now, we'll allow access in non-Supabase environments
    console.log("[SubscriptionCheck] Non-Supabase provider: allowing access (implement Firebase check if needed)")
    return null
  } catch (error) {
    console.error("[SubscriptionCheck] Error checking premium access:", error)
    return NextResponse.json({ error: "Failed to verify subscription status" }, { status: 500 })
  }
}
