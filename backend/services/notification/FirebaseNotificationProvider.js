class FirebaseNotificationProvider {
  constructor(config) {
    this.name = 'FirebaseNotificationProvider';
    this.config = config;
  }

  async sendNotification(params) {
    throw new Error('Firebase credentials not configured. Fallback to MockNotificationProvider.');
  }
}

module.exports = FirebaseNotificationProvider;
