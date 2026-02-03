const pool = require('../db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Add STRIPE_SECRET_KEY to .env

const createCheckoutSession = async (req, res) => {
  const { planType } = req.body; // 'monthly' or 'annual'
  const userId = req.user.id;

  const priceId = planType === 'annual' 
    ? 'price_annual_dummy_id' // Replace with real Stripe Price ID or use ad-hoc line_items below
    : 'price_monthly_dummy_id'; 

  const amount = planType === 'annual' ? 19999 : 1999; // In cents
  const productName = planType === 'annual' ? 'Premium Annual' : 'Premium Monthly';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `MediConnect ${productName}`,
              description: 'Unlock 24/7 AI Chat, Priority Booking, and Dark Gold Theme.',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,
      metadata: {
        userId: userId,
        planType: planType
      }
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Payment session creation failed" });
  }
};

const handlePaymentSuccess = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId;
      
      // Upgrade User in DB
      await pool.query(
        "UPDATE users SET is_premium = TRUE, subscription_end_date = NOW() + INTERVAL '1 year' WHERE id = $1",
        [userId]
      );
      
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Payment not verified" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { createCheckoutSession, handlePaymentSuccess };