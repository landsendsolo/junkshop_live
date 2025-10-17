const functions = require("firebase-functions");
const fetch = require("node-fetch");

// IMPORTANT: Set your SumUp secret key in your Firebase project's environment variables.
// Run this command in your terminal (see deployment guide):
// firebase functions:config:set sumup.secret_key="YOUR_SUMUP_SECRET_KEY"
const SUMUP_SECRET_KEY = functions.config().sumup.secret_key;

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

  const checkoutData = {
    checkout_reference: `JUNKSHOP-${Date.now()}`,
    amount: amount,
    currency: currency,
    description: description,
    pay_to_email: "junkshopdumfries@gmail.com", // Your SumUp merchant email
    customer_email: customerEmail,
    return_url: "https://junkshop.website", // Your final domain
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
        "Failed to create SumUp checkout."
      );
    }

    const checkoutResponse = await response.json();
    return { checkoutId: checkoutResponse.id };
  } catch (error) {
    console.error("Error creating SumUp checkout:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while creating the checkout."
    );
  }
});

