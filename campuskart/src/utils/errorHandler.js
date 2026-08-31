/**
 * ErrorHandler - Utility for consistent error handling across the app
 */

export const ErrorHandler = {
  getErrorMessage(err) {
    if (!err) return 'An unexpected error occurred.';
    if (typeof err === 'string') return err;

    const status = err.status;
    const code = err.data?.error;

    if (status === 401) return 'Session expired. Please log in again.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 409) return err.data?.message || 'This action conflicts with the current state.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'Server error. Please try again later.';

    switch (code) {
      case 'MISSING_FIELDS': return 'Please fill in all required fields.';
      case 'INVALID_CREDENTIALS': return 'Invalid email or password.';
      case 'EMAIL_ALREADY_REGISTERED': return 'An account with this email already exists.';
      case 'UNSUPPORTED_INSTITUTION': return 'Only @heritageit.edu.in emails are allowed.';
      case 'INVALID_OR_EXPIRED_CODE': return 'Invalid or expired verification code.';
      case 'INVALID_OR_EXPIRED_TOKEN': return 'This reset link has expired. Please request a new one.';
      case 'PASSWORD_TOO_SHORT': return 'Password must be at least 8 characters.';
      case 'CANNOT_MESSAGE_OWN_LISTING': return 'You cannot message your own listing.';
      case 'CANNOT_ACT_ON_OWN_OFFER': return 'You cannot act on your own offer.';
      case 'OFFER_NOT_PENDING': return 'This offer is no longer pending.';
      case 'COUNTER_REQUIRES_AMOUNT': return 'Counter offer requires an amount.';
      case 'ACCOUNT_BANNED': return 'Your account has been suspended.';
      case 'VALIDATION_ERROR': return 'Please check your input and try again.';
      default: return err.message || 'An unexpected error occurred.';
    }
  },

  isAuthError(err) {
    return err?.status === 401;
  },

  isNetworkError(err) {
    return !err?.status || err.name === 'TypeError';
  },
};
