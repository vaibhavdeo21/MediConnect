const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');

/**
 * Create a Stripe Checkout Session
 * Uses INR and redirects directly via URL
 */
const createCheckoutSession = async (req, res) => {
  const { planType } = req.body;
  const userId = req.user.id;

  // Pricing in Paise (INR): 159900 = ₹1,599 for monthly, e.g., ₹15,999 for annual (1599900)
  const amount = planType === 'annual' ? 1599900 : 159900; 
  const productName = planType === 'annual' ? 'Elite Annual' : 'Elite Monthly';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `MediConnect ${productName}`,
              description: '24/7 AI Assistant, Priority Booking, and Luxury Theme Access.',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe`,
      metadata: {
        userId: userId,
        planType: planType,
        amount: amount / 100 // storing actual INR amount
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ error: "Failed to create payment session" });
  }
};

/**
 * Verify Payment Success
 * Updates user to Premium, records subscription, and rewards Referrers
 */
const verifyPayment = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId;
      const planType = session.metadata.planType;
      const amount = session.metadata.amount;

      // Update User to Premium status with correct interval
      const interval = planType === 'annual' ? '1 year' : '1 month';
      await pool.query(
        `UPDATE users SET is_premium = TRUE, subscription_end_date = NOW() + INTERVAL '${interval}' WHERE id = $1`,
        [userId]
      );

      // Record subscription
      await pool.query(
        `INSERT INTO subscriptions (user_id, stripe_session_id, plan_type, status, amount, expires_at) 
         VALUES ($1, $2, $3, 'active', $4, NOW() + INTERVAL '${interval}')`,
        [userId, sessionId, planType, amount]
      );

      // Referral Reward Logic
      const userResult = await pool.query("SELECT referred_by FROM users WHERE id = $1", [userId]);
      const referrerCode = userResult.rows[0]?.referred_by;

      if (referrerCode) {
        // Add credit to Referrer's balance
        await pool.query("UPDATE users SET wallet_balance = wallet_balance + 200 WHERE referral_code = $1", [referrerCode]);
        
        const referrerRes = await pool.query("SELECT id, wallet_balance FROM users WHERE referral_code = $1", [referrerCode]);
        if (referrerRes.rows.length > 0) {
          const referrerId = referrerRes.rows[0].id;
          const newBalance = referrerRes.rows[0].wallet_balance;
          // Record transaction
          await pool.query(
            `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference_type, created_by)
             VALUES ($1, 'referral_bonus', 200, $2, 'Referral bonus for premium upgrade', 'system', 'system')`,
            [referrerId, newBalance]
          );
        }
      }

      return res.json({ success: true, message: "Account upgraded to Premium" });
    } else {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Verification Error:", error.message);
    res.status(500).json({ error: "Internal Server Error during verification" });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT *, 
       EXTRACT(DAY FROM (expires_at - NOW())) as days_remaining 
       FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ status: 'none' });
    }
  } catch (error) {
    console.error("Get Subscription Status Error:", error);
    res.status(500).json({ error: "Failed to get subscription status" });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Set cancelled_at, but keep status 'active' until expires_at, or set status 'cancelled' immediately if desired.
    // The instructions say "Sets cancelled_at, keeps access until expires_at, updates subscription status"
    // So we'll set status to 'cancelled', but middleware should still allow access if expires_at > NOW().
    
    await pool.query(
      `UPDATE subscriptions 
       SET cancelled_at = NOW(), status = 'cancelled' 
       WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()`,
      [userId]
    );

    res.json({ message: "Subscription cancelled successfully. You will have access until the end of your billing period." });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({ error: "Failed to get payment history" });
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
  getSubscriptionStatus,
  cancelSubscription,
  getPaymentHistory
};