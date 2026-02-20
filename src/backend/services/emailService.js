const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendEmail = async (emailData) => {
  try {
    if (!validateEmailFormat(emailData.to)) {
      return { success: false, message: 'Invalid email address' };
    }
    
    // Mock email sending - in real app would use nodemailer or similar
    console.log('Email sent:', emailData);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to send email' };
  }
};

const sendWelcomeEmail = async (userData) => {
  const emailData = {
    to: userData.email,
    subject: 'Welcome to SkillSwap!',
    text: `Welcome ${userData.name}! Thank you for joining SkillSwap.`,
    html: `<h1>Welcome ${userData.name}!</h1><p>Thank you for joining SkillSwap.</p>`
  };
  
  return await sendEmail(emailData);
};

const sendNotificationEmail = async (notificationData) => {
  const emailData = {
    to: notificationData.to,
    subject: 'New Notification from SkillSwap',
    text: `You have a new ${notificationData.type} notification.`,
    html: `<h2>New ${notificationData.type} notification</h2>`
  };
  
  return await sendEmail(emailData);
};

module.exports = {
  validateEmailFormat,
  sendEmail,
  sendWelcomeEmail,
  sendNotificationEmail
};
