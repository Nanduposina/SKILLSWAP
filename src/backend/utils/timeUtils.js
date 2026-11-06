// Centralized time utilities for Swedish timezone (Backend)
const SWEDISH_TIMEZONE = 'Europe/Stockholm';

/**
 * Format date to Swedish time string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted Swedish time string
 */
const formatSwedishTime = (date = new Date()) => {
  return new Date(date).toLocaleString('sv-SE', {
    timeZone: SWEDISH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

module.exports = {
  formatSwedishTime
};
