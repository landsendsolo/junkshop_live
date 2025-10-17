const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {defineString} = require("firebase-functions/params");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Initialize Firebase Admin SDK
admin.initializeApp();

// IMPORTANT: Set your SumUp API key in your Firebase project's environment variables.
// Run this command in your terminal (see deployment guide):
// firebase functions:config:set sumup.api_key="YOUR_SUMUP_API_KEY"
// OR for OAuth: firebase functions:config:set sumup.access_token="YOUR_ACCESS_TOKEN"
// For v2 functions, use environment variables directly or Firebase Params
const SUMUP_API_KEY = process.env.SUMUP_API_KEY;
const SUMUP_ACCESS_TOKEN = process.env.SUMUP_ACCESS_TOKEN;
const SUMUP_AUTH = SUMUP_ACCESS_TOKEN || SUMUP_API_KEY;

// Site URL for redirects
const SITE_URL = "https://junkshop-website-gem.web.app";

// Specify the region for the function using v2 syntax
exports.createSumupCheckout = onCall({region: 'europe-west2'}, async (request) => {
  // Check if the user is authenticated (either an admin or an anonymous customer)
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { amount, currency, description, customerEmail } = request.data;

  if (!amount || !currency || !description || !customerEmail) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required data: amount, currency, description, customerEmail."
    );
  }

  // Validate amount (must be positive)
  if (amount <= 0) {
    throw new HttpsError(
      "invalid-argument",
      "Amount must be greater than zero."
    );
  }

  if (!SUMUP_AUTH) {
    console.error("SumUp authentication not configured");
    throw new HttpsError(
      "failed-precondition",
      "Payment system not configured. Please contact support."
    );
  }

  try {
    // STEP 1: Get merchant code from SumUp API
    console.log("Fetching merchant profile...");
    const merchantResponse = await fetch("https://api.sumup.com/v0.1/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SUMUP_AUTH}`,
      },
    });

    if (!merchantResponse.ok) {
      const errorBody = await merchantResponse.json().catch(() => ({}));
      console.error("SumUp merchant API Error:", errorBody);
      throw new HttpsError(
        "internal",
        `Failed to retrieve merchant information: ${errorBody.message || 'Unknown error'}`
      );
    }

    const merchantData = await merchantResponse.json();
    const merchantCode = merchantData.merchant_profile?.merchant_code;

    if (!merchantCode) {
      console.error("Merchant code not found in response:", merchantData);
      throw new HttpsError(
        "internal",
        "Merchant code not available. Please check SumUp account configuration."
      );
    }

    console.log("Merchant code:", merchantCode);

    // STEP 2: Create checkout with hosted checkout enabled
    const checkoutData = {
      checkout_reference: `JUNKSHOP-${Date.now()}`,
      amount: amount,
      currency: currency,
      description: description,
      merchant_code: merchantCode,
      pay_to_email: "junkshopdumfries@gmail.com",
      redirect_url: `${SITE_URL}/payment-success.html`,
      hosted_checkout: {
        enabled: true
      }
    };

    console.log("Creating SumUp checkout with data:", JSON.stringify(checkoutData, null, 2));

    const response = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUMUP_AUTH}`,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("SumUp checkout API Error:", errorBody);
      throw new HttpsError(
        "internal",
        `SumUp API error: ${errorBody.message || response.statusText || 'Unknown error'}`
      );
    }

    const checkoutResponse = await response.json();
    console.log("SumUp checkout created:", checkoutResponse.id);
    
    // Extract hosted checkout URL
    const hostedCheckoutUrl = checkoutResponse.hosted_checkout_url;
    
    if (!hostedCheckoutUrl) {
      console.error("Hosted checkout URL not found in response:", checkoutResponse);
      throw new HttpsError(
        "internal",
        "Payment page URL not received. Please contact support."
      );
    }

    console.log("Hosted checkout URL:", hostedCheckoutUrl);

    return { 
      checkoutId: checkoutResponse.id,
      hostedCheckoutUrl: hostedCheckoutUrl,
      checkoutReference: checkoutResponse.checkout_reference
    };
  } catch (error) {
    console.error("Error creating SumUp checkout:", error);
    
    if (error.code) {
      // If it's already a HttpsError, re-throw it
      throw error;
    }
    
    throw new HttpsError(
      "internal",
      "An unexpected error occurred while creating the checkout. Please try again."
    );
  }
});

// Webhook handler for SumUp payment notifications
exports.handleSumupWebhook = onRequest({region: 'europe-west2'}, async (req, res) => {
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

