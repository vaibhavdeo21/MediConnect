const pool = require('../db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Add STRIPE_SECRET_KEY to .env

const createCheckoutSession = async (req, res) => {
  const { planType } = req.body;
  const userId = req.user.id;
  const amount = planType === 'annual' ? 1599900 : 159900; 

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `MediConnect Premium ${planType === 'annual' ? 'Annual' : 'Monthly'}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe`,
      metadata: { userId: userId }
    });

    // Send the URL instead of just the ID
    res.json({ url: session.url }); 
  } catch (error) {
    res.status(500).json({ error: error.message });
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