const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');

/**
 * Create a Stripe Checkout Session
 * Uses INR and redirects directly via URL
 */
const createCheckoutSession = async (req, res) => {
  const { planType } = req.body;
  const userId = req.user.id;

  // Pricing in Paise (INR): 159900 = ₹1,599
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
      // Redirects back to our frontend success page with the session ID
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe`,
      metadata: {
        userId: userId,
        planType: planType
      }
    });

    // Return the URL for the frontend to redirect to
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ error: "Failed to create payment session" });
  }
};

/**
 * Verify Payment Success
 * Updates user to Premium and rewards Referrers
 */
const verifyPayment = async (req, res) => {
  const { sessionId } = req.body;

  try {
    // 1. Retrieve the session from Stripe to ensure it's paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId;

      // 2. Update User to Premium status in Database
      await pool.query(
        "UPDATE users SET is_premium = TRUE, subscription_end_date = NOW() + INTERVAL '1 month' WHERE id = $1",
        [userId]
      );

      // 3. Referral Reward Logic
      // Check if this user was referred by someone
      const userResult = await pool.query("SELECT referred_by FROM users WHERE id = $1", [userId]);
      const referrerCode = userResult.rows[0]?.referred_by;

      if (referrerCode) {
        // Option A: Simply log the successful referral
        console.log(`User ${userId} upgraded. Referrer ${referrerCode} earns a reward.`);

        // Option B: Add credit to Referrer's balance (if you have a balance column)
        // await pool.query("UPDATE users SET wallet_balance = wallet_balance + 200 WHERE referral_code = $1", [referrerCode]);
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

module.exports = {
  createCheckoutSession,
  verifyPayment
};