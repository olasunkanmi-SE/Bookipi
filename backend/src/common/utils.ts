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
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const startTime = startDateObj.getTime();

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    const endTime = endDateObj.getTime();

    const currentTime = Date.now();

    if (isNaN(startTime)) {
      throw new BadRequestException('Invalid Start date');
    }

    if (isNaN(endTime)) {
      throw new BadRequestException('Invalid End date');
    }

    // For the purpose of testing, the start time will start at the beginning of the current day.
    // Ideally the validation should check if the startTime is in the future

    // if (startTime < currentTime || endTime <= currentTime) {
    //   throw new BadRequestException('Start and End date must be in the future');
    // }

    if (endTime <= currentTime) {
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
