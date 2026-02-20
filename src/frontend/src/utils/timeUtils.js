// Centralized time utilities for Swedish timezone
const SWEDISH_TIMEZONE = 'Europe/Stockholm';

/**
 * Format date to Swedish time with consistent formatting
 * @param {string|Date} dateString - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatSwedishTime = (dateString, options = {}) => {
  const defaultOptions = {
    timeZone: SWEDISH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Date(dateString).toLocaleString('sv-SE', mergedOptions);
};

/**
 * Format date for display in lists (shorter format)
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatSwedishDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    timeZone: SWEDISH_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date for short display (month and day only)
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatSwedishDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    timeZone: SWEDISH_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format relative time (e.g., "2h ago", "3d ago")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time string
 */
export const formatSwedishTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  
  // Convert both to Swedish timezone for accurate comparison
  const nowSwedish = new Date(now.toLocaleString('en-US', { timeZone: SWEDISH_TIMEZONE }));
  const dateSwedish = new Date(date.toLocaleString('en-US', { timeZone: SWEDISH_TIMEZONE }));
  
  const diffInSeconds = Math.floor((nowSwedish - dateSwedish) / 1000);

  if (diffInSeconds < 60) return 'Just nu';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m sedan`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h sedan`;
  return `${Math.floor(diffInSeconds / 86400)}d sedan`;
};

/**
 * Get current Swedish time
 * @returns {Date} Current date in Swedish timezone
 */
export const getCurrentSwedishTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: SWEDISH_TIMEZONE }));
};

/**
 * Convert any date to Swedish timezone
 * @param {string|Date} dateString - Date to convert
 * @returns {Date} Date in Swedish timezone
 */
export const toSwedishTime = (dateString) => {
  return new Date(new Date(dateString).toLocaleString('en-US', { timeZone: SWEDISH_TIMEZONE }));
};

/**
 * Format date for API requests (ISO string in Swedish timezone)
 * @param {Date} date - Date to format
 * @returns {string} ISO string
 */
export const formatForAPI = (date = new Date()) => {
  return toSwedishTime(date).toISOString();
};
