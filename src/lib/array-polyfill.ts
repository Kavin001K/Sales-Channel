// Array polyfill to ensure filter and other array methods are always safe

// Store original methods
const originalFilter = Array.prototype.filter;
const originalMap = Array.prototype.map;
const originalFind = Array.prototype.find;
const originalReduce = Array.prototype.reduce;

// Helper function to safely check if something is an array
const safeIsArray = (value: any): boolean => {
  try {
    return Array.isArray(value) && value !== null && value !== undefined;
  } catch {
    return false;
  }
};

// Helper function to safely get array length
const safeLength = (arr: any): number => {
  try {
    return safeIsArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
};

// Override Array.prototype.filter to be more defensive
Array.prototype.filter = function(callback: any, thisArg?: any) {
  try {
    // Check if this is actually an array
    if (!safeIsArray(this)) {
      console.warn('Array.prototype.filter called on non-array:', this);
      return [];
    }
    
    // Check if callback is a function
    if (typeof callback !== 'function') {
      console.warn('Array.prototype.filter called with non-function callback:', callback);
      return [];
    }
    
    // Check if array has been corrupted
    const length = safeLength(this);
    if (length === 0) return [];
    
    // Use the original filter method
    return originalFilter.call(this, callback, thisArg);
  } catch (error) {
    console.error('Error in Array.prototype.filter:', error);
    return [];
  }
};

// Override Array.prototype.map to be more defensive
Array.prototype.map = function(callback: any, thisArg?: any) {
  try {
    if (!safeIsArray(this)) {
      console.warn('Array.prototype.map called on non-array:', this);
      return [];
    }
    
    if (typeof callback !== 'function') {
      console.warn('Array.prototype.map called with non-function callback:', callback);
      return [];
    }
    
    const length = safeLength(this);
    if (length === 0) return [];
    
    return originalMap.call(this, callback, thisArg);
  } catch (error) {
    console.error('Error in Array.prototype.map:', error);
    return [];
  }
};

// Override Array.prototype.find to be more defensive
Array.prototype.find = function(callback: any, thisArg?: any) {
  try {
    if (!safeIsArray(this)) {
      console.warn('Array.prototype.find called on non-array:', this);
      return undefined;
    }
    
    if (typeof callback !== 'function') {
      console.warn('Array.prototype.find called with non-function callback:', callback);
      return undefined;
    }
    
    const length = safeLength(this);
    if (length === 0) return undefined;
    
    return originalFind.call(this, callback, thisArg);
  } catch (error) {
    console.error('Error in Array.prototype.find:', error);
    return undefined;
  }
};

// Override Array.prototype.reduce to be more defensive
Array.prototype.reduce = function(callback: any, initialValue?: any) {
  try {
    if (!safeIsArray(this)) {
      console.warn('Array.prototype.reduce called on non-array:', this);
      return initialValue;
    }
    
    if (typeof callback !== 'function') {
      console.warn('Array.prototype.reduce called with non-function callback:', callback);
      return initialValue;
    }
    
    const length = safeLength(this);
    if (length === 0 && arguments.length < 2) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    
    return originalReduce.call(this, callback, initialValue);
  } catch (error) {
    console.error('Error in Array.prototype.reduce:', error);
    return initialValue;
  }
};

// Safe filter polyfill (fallback for older browsers)
if (typeof Array.prototype.filter !== 'function') {
  Array.prototype.filter = function(callback: any, thisArg?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.filter called on null or undefined');
    }
    
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    
    const O = Object(this);
    const len = O.length >>> 0;
    const result = [];
    let k = 0;
    
    while (k < len) {
      if (k in O) {
        const kValue = O[k];
        if (callback.call(thisArg, kValue, k, O)) {
          result.push(kValue);
        }
      }
      k++;
    }
    
    return result;
  };
}

// Safe map polyfill (fallback for older browsers)
if (typeof Array.prototype.map !== 'function') {
  Array.prototype.map = function(callback: any, thisArg?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.map called on null or undefined');
    }
    
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    
    const O = Object(this);
    const len = O.length >>> 0;
    const result = new Array(len);
    let k = 0;
    
    while (k < len) {
      if (k in O) {
        result[k] = callback.call(thisArg, O[k], k, O);
      }
      k++;
    }
    
    return result;
  };
}

// Safe find polyfill (fallback for older browsers)
if (typeof Array.prototype.find !== 'function') {
  Array.prototype.find = function(callback: any, thisArg?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    
    const O = Object(this);
    const len = O.length >>> 0;
    let k = 0;
    
    while (k < len) {
      if (k in O) {
        const kValue = O[k];
        if (callback.call(thisArg, kValue, k, O)) {
          return kValue;
        }
      }
      k++;
    }
    
    return undefined;
  };
}

// Safe reduce polyfill (fallback for older browsers)
if (typeof Array.prototype.reduce !== 'function') {
  Array.prototype.reduce = function(callback: any, initialValue?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    
    const O = Object(this);
    const len = O.length >>> 0;
    let k = 0;
    let accumulator;
    
    if (arguments.length >= 2) {
      accumulator = initialValue;
    } else {
      if (len === 0) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      accumulator = O[k++];
    }
    
    while (k < len) {
      if (k in O) {
        accumulator = callback.call(undefined, accumulator, O[k], k, O);
      }
      k++;
    }
    
    return accumulator;
  };
}

// Enhanced Array.isArray check
const originalIsArray = Array.isArray;
Array.isArray = function(arg: any): arg is any[] {
  try {
    if (originalIsArray) {
      return originalIsArray(arg);
    }
    return Object.prototype.toString.call(arg) === '[object Array]';
  } catch {
    return false;
  }
};

// Add a safe filter method to all objects that might be arrays
Object.defineProperty(Object.prototype, 'safeFilter', {
  value: function(callback: any, thisArg?: any) {
    if (safeIsArray(this)) {
      return this.filter(callback, thisArg);
    }
    console.warn('safeFilter called on non-array:', this);
    return [];
  },
  writable: true,
  configurable: true
});

console.log('Array polyfills loaded successfully');
