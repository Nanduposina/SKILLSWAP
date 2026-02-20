// Centralized time utilities for Swedish timezone (Backend)
const SWEDISH_TIMEZONE = 'Europe/Stockholm';

/**
 * Get current Swedish time as ISO string
 * @returns {string} Current time in Swedish timezone as ISO string
 */
const getCurrentSwedishTimeISO = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: SWEDISH_TIMEZONE })).toISOString();
};

/**
 * Get current Swedish time as Date object
 * @returns {Date} Current time in Swedish timezone
 */
const getCurrentSwedishTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: SWEDISH_TIMEZONE }));
};

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

/**
 * Convert any date to Swedish timezone ISO string
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO string in Swedish timezone
 */
const toSwedishTimeISO = (date = new Date()) => {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone: SWEDISH_TIMEZONE })).toISOString();
};

/**
 * Get Swedish time for database operations
 * @returns {string} Current Swedish time formatted for SQLite
 */
const getSwedishTimeForDB = () => {
  const swedishTime = getCurrentSwedishTime();
  return swedishTime.toISOString().replace('T', ' ').replace('Z', '');
};

module.exports = {
  getCurrentSwedishTimeISO,
  getCurrentSwedishTime,
  formatSwedishTime,
  toSwedishTimeISO,
  getSwedishTimeForDB,
  SWEDISH_TIMEZONE
};
