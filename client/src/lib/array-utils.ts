// Safe array utilities to prevent "filter is not a function" errors

/**
 * Safely filters an array, returning an empty array if the input is not an array
 */
export const safeFilter = <T>(array: unknown, predicate: (item: T, index: number, array: T[]) => boolean): T[] => {
  if (!Array.isArray(array)) {
    console.warn('safeFilter: Input is not an array:', array);
    return [];
  }
  try {
    return array.filter(predicate);
  } catch (error) {
    console.error('safeFilter: Error during filter operation:', error);
    return [];
  }
};

/**
 * Safely maps over an array, returning an empty array if the input is not an array
 */
export const safeMap = <T, U>(array: unknown, mapper: (item: T, index: number, array: T[]) => U): U[] => {
  if (!Array.isArray(array)) {
    console.warn('safeMap: Input is not an array:', array);
    return [];
  }
  try {
    return array.map(mapper);
  } catch (error) {
    console.error('safeMap: Error during map operation:', error);
    return [];
  }
};

/**
 * Safely finds an item in an array, returning undefined if the input is not an array
 */
export const safeFind = <T>(array: unknown, predicate: (item: T, index: number, array: T[]) => boolean): T | undefined => {
  if (!Array.isArray(array)) {
    console.warn('safeFind: Input is not an array:', array);
    return undefined;
  }
  try {
    return array.find(predicate);
  } catch (error) {
    console.error('safeFind: Error during find operation:', error);
    return undefined;
  }
};

/**
 * Safely reduces an array, returning the initial value if the input is not an array
 */
export const safeReduce = <T, U>(
  array: unknown, 
  reducer: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U, 
  initialValue: U
): U => {
  if (!Array.isArray(array)) {
    console.warn('safeReduce: Input is not an array:', array);
    return initialValue;
  }
  try {
    return array.reduce(reducer, initialValue);
  } catch (error) {
    console.error('safeReduce: Error during reduce operation:', error);
    return initialValue;
  }
};

/**
 * Ensures a value is an array, returning an empty array if it's not
 */
export const ensureArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  console.warn('ensureArray: Value is not an array:', value);
  return [];
};

/**
 * Safely gets the length of an array, returning 0 if the input is not an array
 */
export const safeLength = (array: unknown): number => {
  if (!Array.isArray(array)) {
    return 0;
  }
  return array.length;
};