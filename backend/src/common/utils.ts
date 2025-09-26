import { BadRequestException, Logger } from '@nestjs/common';

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

export const parseAndValidateDates = (startDate: string, endDate: string) => {
  try {
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    const currentTime = Date.now();

    if (isNaN(startTime)) {
      throw new BadRequestException('Invalid Start date');
    }

    if (isNaN(endTime)) {
      throw new BadRequestException('Invalid End date');
    }

    if (startTime <= currentTime || endTime <= currentTime) {
      throw new BadRequestException('Start and End date must be in the future');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be greater than start time');
    }
  } catch (error) {
    logError(error, 'parseAndValidateDates');
    throw error;
  }
};
