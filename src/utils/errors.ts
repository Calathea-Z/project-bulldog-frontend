/**
 * Utility function to handle mutation errors with user-friendly messages
 * @param error - The error object from the mutation
 * @param fallbackMessage - Fallback message if error details are not available
 * @returns User-friendly error message
 */
export function getMutationErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Operation failed',
): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }

    // HTTP errors
    if (error.message.includes('404')) {
      return 'Item not found. It may have been deleted.';
    }
    if (error.message.includes('403')) {
      return "You don't have permission to perform this action.";
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }

    return error.message;
  }

  return fallbackMessage;
}
