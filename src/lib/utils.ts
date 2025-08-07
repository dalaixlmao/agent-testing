import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (date: string | Date) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInMs = new Date(date).getTime() - now.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (Math.abs(diffInDays) >= 7) {
    return formatDate(date);
  } else if (diffInDays !== 0) {
    return rtf.format(diffInDays, 'day');
  } else if (diffInHours !== 0) {
    return rtf.format(diffInHours, 'hour');
  } else if (diffInMins !== 0) {
    return rtf.format(diffInMins, 'minute');
  } else {
    return rtf.format(diffInSecs, 'second');
  }
};

export const getInitials = (name: string = '') => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Function to determine if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';