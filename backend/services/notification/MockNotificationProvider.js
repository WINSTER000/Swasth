const Notification = require('../../models/Notification');

class MockNotificationProvider {
  constructor() {
    this.name = 'MockNotificationProvider';
  }

  async sendNotification({ userId, title, message, type, link }) {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      isRead: false,
    });
    return {
      success: true,
      provider: this.name,
      notificationId: notification._id,
      timestamp: new Date(),
    };
  }
}

module.exports = MockNotificationProvider;
