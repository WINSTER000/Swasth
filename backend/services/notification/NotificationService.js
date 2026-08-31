const MockNotificationProvider = require('./MockNotificationProvider');
const FirebaseNotificationProvider = require('./FirebaseNotificationProvider');

class NotificationService {
  constructor() {
    const providerType = process.env.NOTIFICATION_PROVIDER || 'mock';
    if (providerType === 'firebase' && process.env.FIREBASE_PROJECT_ID) {
      this.provider = new FirebaseNotificationProvider({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      });
    } else {
      this.provider = new MockNotificationProvider();
    }
    console.log(`[NotificationService] Initialized with provider: ${this.provider.name}`);
  }

  async send(params) {
    try {
      return await this.provider.sendNotification(params);
    } catch (err) {
      const fallback = new MockNotificationProvider();
      return await fallback.sendNotification(params);
    }
  }
}

module.exports = new NotificationService();
