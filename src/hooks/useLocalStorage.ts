import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Utility to clear specific localStorage key
export function clearLocalStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing localStorage key "${key}":`, error);
  }
}

// Utility to get all flashcard related keys for debugging
export function getStorageInfo() {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('flashmaster') || key.startsWith('flashcard')
  );
  
  return keys.map(key => ({
    key,
    size: localStorage.getItem(key)?.length || 0,
    data: localStorage.getItem(key),
  }));
}