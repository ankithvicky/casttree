const { google } = require("googleapis");
const path = require("path");

const serviceAccountPath = path.join(
  __dirname,
  "/casttree-d50d2cec9329.json"
);
console.log("serviceAccountPath is", serviceAccountPath);
const auth = new google.auth.GoogleAuth({
  keyFile: serviceAccountPath,
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});

const androidpublisher = google.androidpublisher({
  version: "v3",
  auth: auth,
});

async function verifyPurchase(packageName, purchaseToken) {
  try {
    const res = await androidpublisher.purchases.subscriptionsv2.get({
      packageName: packageName,
      token: purchaseToken,
    });
    console.log("Purchase verification response:", JSON.stringify(res.data));
    // Add your logic to handle the verification response
  } catch (err) {
    console.error("Error verifying purchase:", err);
  }
}

// Example usage:
const packageName = "com.billionfaces.casttree";
const productId = "cas_9_1m_0d0";
const purchaseToken =
  "hgcjfepilompdngdidgpifhg.AO-J1OxrL-xBzUsX7z45LVQUGEwwVXHxPaGRHp4rtzoNCoLw1VXVuXvH66KjglIkdB-OwBfArIZfsDJ8UssdZgo34NZZFmdr7NoG1a_T8bBC7lmEbdOIdA8";
verifyPurchase(packageName, purchaseToken);
