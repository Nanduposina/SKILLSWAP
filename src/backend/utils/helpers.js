const formatDate = (date) => {
  if (!date) return 'Invalid Date';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 SEK';
  return `${amount} SEK`;
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const sanitizeInput = (input) => {
  if (!input) return '';
  if (typeof input !== 'string') return '';
  // Remove script tags but keep the content
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (match) => {
    // Extract content between script tags
    const contentMatch = match.match(/<script[^>]*>(.*?)<\/script>/i);
    return contentMatch ? contentMatch[1] : '';
  });
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

module.exports = {
  formatDate,
  formatCurrency,
  generateId,
  sanitizeInput,
  calculateDistance
};
