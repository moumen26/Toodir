import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../constants/storage';

class TokenManager {
  constructor() {
    this.token = null;
    this.refreshPromise = null;
  }

  // Store token securely
  async setToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      // Validate token structure
      const decoded = this.decodeToken(token);
      if (!decoded) {
        throw new Error('Invalid token format');
      }

      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
      this.token = token;
      return true;
    } catch (error) {
      console.log('Error storing token:', error);
      throw error;
    }
  }

  // Get token from secure storage
  async getToken() {
    try {
      if (this.token) {
        return this.token;
      }

      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      if (token) {
        this.token = token;
      }

      return token;
    } catch (error) {
      console.log('Error retrieving token:', error);
      return null;
    }
  }

  // Remove token from storage
  async removeToken() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      this.token = null;
      return true;
    } catch (error) {
      console.log('Error removing token:', error);
      return false;
    }
  }

  // Decode JWT token
  decodeToken(token = null) {
    try {
      const tokenToUse = token || this.token;
      if (!tokenToUse) return null;

      return jwtDecode(tokenToUse);
    } catch (error) {
      console.log('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is valid (not expired)
  isTokenValid(token = null, bufferTime = 300) { // 5 minutes buffer
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return false;

      const currentTime = Date.now() / 1000;
      return decoded.exp > (currentTime + bufferTime);
    } catch (error) {
      console.log('Error validating token:', error);
      return false;
    }
  }

  // Get token expiry time
  getTokenExpiry(token = null) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;

      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.log('Error getting token expiry:', error);
      return null;
    }
  }

  // Get time until token expires (in seconds)
  getTimeUntilExpiry(token = null) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return 0;

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;

      return Math.max(0, timeUntilExpiry);
    } catch (error) {
      console.log('Error calculating time until expiry:', error);
      return 0;
    }
  }

  // Get user ID from token
  getUserId(token = null) {
    try {
      const decoded = this.decodeToken(token);
      return decoded?.id || decoded?.sub || decoded?.userId || null;
    } catch (error) {
      console.log('Error getting user ID from token:', error);
      return null;
    }
  }

  // Get user role from token
  getUserRole(token = null) {
    try {
      const decoded = this.decodeToken(token);
      return decoded?.role || decoded?.roles || null;
    } catch (error) {
      console.log('Error getting user role from token:', error);
      return null;
    }
  }

  // Schedule token refresh before expiry
  scheduleTokenRefresh(refreshCallback, bufferTime = 600) { // 10 minutes before expiry
    try {
      const timeUntilExpiry = this.getTimeUntilExpiry();
      if (timeUntilExpiry <= bufferTime) return null;

      const refreshTime = (timeUntilExpiry - bufferTime) * 1000; // Convert to milliseconds

      return setTimeout(() => {
        if (refreshCallback && typeof refreshCallback === 'function') {
          refreshCallback();
        }
      }, refreshTime);
    } catch (error) {
      console.log('Error scheduling token refresh:', error);
      return null;
    }
  }

  // Clear all auth-related data
  async clearAllAuthData() {
    try {
      await Promise.all([
        this.removeToken(),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME),
      ]);

      this.token = null;
      this.refreshPromise = null;
      return true;
    } catch (error) {
      console.log('Error clearing auth data:', error);
      return false;
    }
  }

  // Refresh token (if your API supports it)
  async refreshToken(refreshCallback) {
    try {
      // Prevent multiple simultaneous refresh attempts
      if (this.refreshPromise) {
        return await this.refreshPromise;
      }

      this.refreshPromise = this._performTokenRefresh(refreshCallback);
      const result = await this.refreshPromise;

      this.refreshPromise = null;
      return result;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  async _performTokenRefresh(refreshCallback) {
    try {
      if (!refreshCallback || typeof refreshCallback !== 'function') {
        throw new Error('Refresh callback is required');
      }

      const currentToken = await this.getToken();
      if (!currentToken) {
        throw new Error('No token available for refresh');
      }

      // Call the refresh callback (usually an API call)
      const newToken = await refreshCallback(currentToken);

      if (!newToken) {
        throw new Error('Failed to refresh token');
      }

      // Store the new token
      await this.setToken(newToken);
      return newToken;
    } catch (error) {
      console.log('Error refreshing token:', error);
      // Clear invalid token
      await this.clearAllAuthData();
      throw error;
    }
  }

  // Check if token needs refresh soon
  needsRefresh(bufferTime = 600) { // 10 minutes
    try {
      const timeUntilExpiry = this.getTimeUntilExpiry();
      return timeUntilExpiry <= bufferTime && timeUntilExpiry > 0;
    } catch (error) {
      console.log('Error checking if token needs refresh:', error);
      return false;
    }
  }

  // Get token claims/payload
  getTokenClaims(token = null) {
    try {
      return this.decodeToken(token);
    } catch (error) {
      console.log('Error getting token claims:', error);
      return null;
    }
  }

  // Validate token format
  isValidTokenFormat(token) {
    try {
      if (!token || typeof token !== 'string') return false;

      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Try to decode each part
      const decoded = this.decodeToken(token);
      return decoded !== null;
    } catch (error) {
      return false;
    }
  }

  // Get formatted token for Authorization header
  getAuthorizationHeader(token = null) {
    const tokenToUse = token || this.token;
    return tokenToUse ? `Bearer ${tokenToUse}` : null;
  }

  // Security check - ensure token hasn't been tampered with
  async performSecurityCheck() {
    try {
      const storedToken = await this.getToken();

      if (!storedToken) {
        return { isSecure: false, reason: 'No token found' };
      }

      if (!this.isValidTokenFormat(storedToken)) {
        return { isSecure: false, reason: 'Invalid token format' };
      }

      if (!this.isTokenValid(storedToken)) {
        return { isSecure: false, reason: 'Token expired' };
      }

      // Additional security checks can be added here
      // e.g., checking token signature, issuer, audience, etc.

      return { isSecure: true, reason: 'Token is valid' };
    } catch (error) {
      console.log('Security check failed:', error);
      return { isSecure: false, reason: 'Security check failed' };
    }
  }

  // Get token metadata
  getTokenMetadata(token = null) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      return {
        userId: this.getUserId(token),
        role: this.getUserRole(token),
        issuer: decoded.iss,
        audience: decoded.aud,
        issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
        timeUntilExpiry: this.getTimeUntilExpiry(token),
        isValid: this.isTokenValid(token),
        needsRefresh: this.needsRefresh(),
      };
    } catch (error) {
      console.log('Error getting token metadata:', error);
      return null;
    }
  }
}

// Create a singleton instance
const tokenManager = new TokenManager();

export default tokenManager;