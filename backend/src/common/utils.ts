import { Logger } from '@nestjs/common';

/**
 * A standardized utility to safely log errors from services or controllers.
 * It handles both standard `Error` objects and other thrown types gracefully.
 *
 * @param error The caught error object, typed as `unknown` for type safety.
 * @param action A descriptive string of the action that failed (e.g., 'creating user').
 * @param context The name of the service or module where the error occurred (e.g., 'UsersService').
 */
export const logError = (error: unknown, context: string): void => {
  const logger = new Logger(context);

  if (error instanceof Error) {
    logger.error(`${error.message}`, error.stack, context);
  } else {
    logger.error(`An unexpected, non-error object was thrown`, error, context);
  }
};
