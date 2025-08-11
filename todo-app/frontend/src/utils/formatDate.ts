import { format, parseISO } from 'date-fns';

/**
 * Format date string to a readable format
 * @param dateString ISO date string
 * @param formatStr Format string for date-fns
 */
export function formatDate(dateString?: string, formatStr = 'PPP'): string {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}