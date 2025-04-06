const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Parse JSON body and Pub/Sub message
app.use(bodyParser.json());

app.post('/google-play-rtdn', (req, res) => {
    try {
        const pubSubMessage = req.body.message;
        const messageBuffer = Buffer.from(pubSubMessage.data, 'base64');
        const notification = JSON.parse(messageBuffer.toString());

        console.log('📬 RTDN received:', notification);

        // Process notification types like SUBSCRIPTION_RECOVERED, CANCELED etc.
        const { subscriptionNotification } = notification;
        const { notificationType, purchaseToken, subscriptionId } = subscriptionNotification;

        console.log(`🧾 Type: ${notificationType}, Token: ${purchaseToken}, SKU: ${subscriptionId}`);

        // TODO: Verify purchase token via Google Play Developer API
        // TODO: Update user subscription status in your DB

        res.status(200).send('OK');
    } catch (err) {
        console.error('❌ Error handling RTDN:', err);
        res.status(500).send('Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 RTDN server running on port ${PORT}`));
