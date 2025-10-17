const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Initialize Firebase Admin SDK
admin.initializeApp();

// IMPORTANT: Set your SumUp secret key in your Firebase project's environment variables.
// Run this command in your terminal (see deployment guide):
// firebase functions:config:set sumup.secret_key="YOUR_SUMUP_SECRET_KEY"
const SUMUP_SECRET_KEY = functions.config().sumup?.secret_key || process.env.SUMUP_SECRET_KEY;

// Specify the region for the function
exports.createSumupCheckout = functions.region('europe-west2').https.onCall(async (data, context) => {
  // Check if the user is authenticated (either an admin or an anonymous customer)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { amount, currency, description, customerEmail } = data;

  if (!amount || !currency || !description || !customerEmail) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required data: amount, currency, description, customerEmail."
    );
  }

  // Validate amount (must be positive)
  if (amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Amount must be greater than zero."
    );
  }

  if (!SUMUP_SECRET_KEY) {
    console.error("SumUp secret key not configured");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Payment system not configured. Please contact support."
    );
  }

  const checkoutData = {
    checkout_reference: `JUNKSHOP-${Date.now()}`,
    amount: amount,
    currency: currency,
    description: description,
    pay_to_email: "junkshopdumfries@gmail.com", // Your SumUp merchant email
    customer_email: customerEmail,
    return_url: "https://junkshop-website-gem.web.app", // Firebase hosting URL
  };

  try {
    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUMUP_SECRET_KEY}`,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("SumUp API Error:", errorBody);
      throw new functions.https.HttpsError(
        "internal",
        `SumUp API error: ${errorBody.message || 'Unknown error'}`
      );
    }

    const checkoutResponse = await response.json();
    console.log("SumUp checkout created:", checkoutResponse.id);
    return { checkoutId: checkoutResponse.id };
  } catch (error) {
    console.error("Error creating SumUp checkout:", error);
    
    if (error.code) {
      // If it's already a HttpsError, re-throw it
      throw error;
    }
    
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while creating the checkout."
    );
  }
});

// Webhook handler for SumUp payment notifications
exports.handleSumupWebhook = functions.region('europe-west2').https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  console.log("Received SumUp webhook:", JSON.stringify(req.body, null, 2));

  const { id, status, checkout_reference } = req.body;

  if (!id || !status) {
    console.error("Invalid webhook payload");
    return res.status(400).send('Bad Request');
  }

  try {
    const db = admin.firestore();

    if (status === 'PAID') {
      // Find order by checkout ID
      const ordersSnapshot = await db.collection('orders')
        .where('sumupCheckoutId', '==', id)
        .limit(1)
        .get();

      if (ordersSnapshot.empty) {
        console.error(`Order not found for checkout ID: ${id}`);
        return res.status(404).send('Order Not Found');
      }

      const orderDoc = ordersSnapshot.docs[0];
      const orderData = orderDoc.data();

      console.log(`Processing payment for order: ${orderDoc.id}`);

      // Update order status and mark products as sold
      const batch = db.batch();

      batch.update(orderDoc.ref, {
        status: 'paid',
        paidAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Mark products as sold
      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
          const productRef = db.collection('products').doc(item.id);
          batch.update(productRef, { status: 'sold' });
        });
      }

      await batch.commit();
      console.log(`Order ${orderDoc.id} marked as paid`);

      // TODO: Send confirmation email here
      // You can use Firebase Extensions (Trigger Email) or implement custom email logic

      return res.status(200).send('OK');
    } else if (status === 'FAILED') {
      // Handle failed payment
      const ordersSnapshot = await db.collection('orders')
        .where('sumupCheckoutId', '==', id)
        .limit(1)
        .get();

      if (!ordersSnapshot.empty) {
        const orderDoc = ordersSnapshot.docs[0];
        await orderDoc.ref.update({
          status: 'payment_failed',
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Order ${orderDoc.id} marked as payment failed`);
      }

      return res.status(200).send('OK');
    }

    // For other statuses, just acknowledge
    return res.status(200).send('OK');
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send('Internal Server Error');
  }
});

