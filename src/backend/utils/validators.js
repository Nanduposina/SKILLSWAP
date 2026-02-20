const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  // Check if it's only numbers
  if (/^\d+$/.test(trimmed)) return false;
  return trimmed.length >= 2;
};

const validateSkillName = (skillName) => {
  if (!skillName || typeof skillName !== 'string') return false;
  const trimmed = skillName.trim();
  // Check if it's only numbers
  if (/^\d+$/.test(trimmed)) return false;
  return trimmed.length >= 2;
};

const validateRating = (rating) => {
  if (typeof rating !== 'number') return false;
  return rating >= 1 && rating <= 5;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateSkillName,
  validateRating
};
