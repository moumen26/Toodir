// utils/performance.js
import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import { InteractionManager, DeviceEventEmitter } from 'react-native';

// Debounce hook for search and form inputs
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events and frequent updates
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  );
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  const { threshold = 0.1, rootMargin = '0px', triggerOnce = false } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        setEntry(entry);

        if (isElementIntersecting && triggerOnce) {
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [elementRef, isIntersecting, entry];
};

// Memory-efficient image loading
export const useImageLoader = () => {
  const imageCache = useRef(new Map());

  const preloadImage = useCallback((uri) => {
    return new Promise((resolve, reject) => {
      if (imageCache.current.has(uri)) {
        resolve(imageCache.current.get(uri));
        return;
      }

      const image = new Image();
      image.onload = () => {
        imageCache.current.set(uri, image);
        resolve(image);
      };
      image.onerror = reject;
      image.src = uri;
    });
  }, []);

  const clearCache = useCallback(() => {
    imageCache.current.clear();
  }, []);

  return { preloadImage, clearCache };
};

// Optimized scroll handling
export const useOptimizedScroll = (onScroll, dependencies = []) => {
  const rafId = useRef(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const optimizedScroll = useCallback(
    (event) => {
      lastScrollY.current = event.nativeEvent.contentOffset.y;

      if (!ticking.current) {
        requestAnimationFrame(() => {
          onScroll(lastScrollY.current);
          ticking.current = false;
        });
        ticking.current = true;
      }
    },
    dependencies
  );

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return optimizedScroll;
};

// Batched state updates
export const useBatchedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const batchedUpdates = useRef([]);
  const timeoutRef = useRef(null);

  const batchUpdate = useCallback((updater) => {
    batchedUpdates.current.push(updater);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = prevState;
        batchedUpdates.current.forEach(update => {
          newState = typeof update === 'function' ? update(newState) : { ...newState, ...update };
        });
        batchedUpdates.current = [];
        return newState;
      });
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate];
};

// Memoized component wrapper
export const withMemo = (Component, areEqual) => {
  return memo(Component, areEqual);
};

// Virtual list optimization
export const useVirtualization = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );

    return {
      items: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const onScroll = useCallback((event) => {
    setScrollTop(event.nativeEvent.contentOffset.y);
  }, []);

  return {
    visibleItems,
    onScroll,
    totalHeight: items.length * itemHeight,
  };
};

// Network request optimization
export const useRequestOptimization = () => {
  const requestCache = useRef(new Map());
  const abortControllers = useRef(new Map());

  const optimizedRequest = useCallback(async (url, options = {}) => {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (requestCache.current.has(cacheKey)) {
      const cached = requestCache.current.get(cacheKey);
      if (Date.now() - cached.timestamp < (options.cacheTime || 300000)) { // 5 min default
        return cached.data;
      }
    }

    // Cancel previous request if exists
    if (abortControllers.current.has(cacheKey)) {
      abortControllers.current.get(cacheKey).abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllers.current.set(cacheKey, controller);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      requestCache.current.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      abortControllers.current.delete(cacheKey);
      return data;
    } catch (error) {
      abortControllers.current.delete(cacheKey);
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
  }, []);

  const clearCache = useCallback(() => {
    requestCache.current.clear();
  }, []);

  const cancelAllRequests = useCallback(() => {
    abortControllers.current.forEach(controller => controller.abort());
    abortControllers.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      cancelAllRequests();
    };
  }, [cancelAllRequests]);

  return { optimizedRequest, clearCache, cancelAllRequests };
};

// Memory pressure detection
export const useMemoryPressure = () => {
  const [memoryPressure, setMemoryPressure] = useState('normal');

  useEffect(() => {
    const handleMemoryWarning = () => {
      setMemoryPressure('high');
      // Clear caches, reduce image quality, etc.
    };

    const subscription = DeviceEventEmitter.addListener(
      'memoryWarning',
      handleMemoryWarning
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return memoryPressure;
};

// Interaction manager for heavy operations
export const useInteractionManager = () => {
  const runAfterInteractions = useCallback((callback) => {
    InteractionManager.runAfterInteractions(callback);
  }, []);

  const createInteractionHandle = useCallback(() => {
    return InteractionManager.createInteractionHandle();
  }, []);

  const clearInteractionHandle = useCallback((handle) => {
    InteractionManager.clearInteractionHandle(handle);
  }, []);

  return {
    runAfterInteractions,
    createInteractionHandle,
    clearInteractionHandle,
  };
};

// Optimized re-render prevention
export const useStableCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, deps);
};

// Lazy component loader
export const useLazyComponent = (importFn, fallback = null) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    importFn()
      .then((module) => {
        setComponent(() => module.default || module);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [importFn]);

  if (loading) return fallback;
  if (error) throw error;
  return Component;
};

// Performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (__DEV__) {
      console.log(`${componentName} rendered ${renderCount.current} times, ${timeSinceLastRender}ms since last render`);
    }
    
    lastRenderTime.current = now;
  });

  const logRenderReason = useCallback((reason) => {
    if (__DEV__) {
      console.log(`${componentName} re-rendered due to: ${reason}`);
    }
  }, [componentName]);

  return { renderCount: renderCount.current, logRenderReason };
};

// Optimized state selector
export const useSelector = (selector, deps = []) => {
  return useMemo(selector, deps);
};

// Efficient list key generator
export const generateListKey = (item, index, prefix = '') => {
  if (item.id) return `${prefix}${item.id}`;
  if (item.key) return `${prefix}${item.key}`;
  return `${prefix}${index}`;
};

// Memory cleanup utility
export const useCleanup = (cleanupFn) => {
  useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};

// Batched layout updates
export const useBatchedLayout = () => {
  const layoutUpdates = useRef([]);
  const rafId = useRef(null);

  const batchLayoutUpdate = useCallback((updateFn) => {
    layoutUpdates.current.push(updateFn);

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        layoutUpdates.current.forEach(update => update());
        layoutUpdates.current = [];
        rafId.current = null;
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return batchLayoutUpdate;
};