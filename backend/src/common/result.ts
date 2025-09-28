import { HttpStatus } from '@nestjs/common';

export class Result<T> {
  isSuccess: boolean;
  private data?: T;
  message?: string;
  errorCode?: HttpStatus;
  constructor(
    isSuccess: boolean,
    data?: T,
    message?: string,
    errorCode?: HttpStatus,
  ) {
    this.data = data;
    this.isSuccess = isSuccess;
    this.message = message;
    this.errorCode = errorCode;
  }

  getValue(): T | undefined {
    return this.data;
  }

  static ok<T>(data: T, message?: string): Result<T> {
    return new Result(true, data, message);
  }

  static fail(message: string, errorcode?: HttpStatus): Result<null> {
    return new Result(false, null, message, errorcode);
  }
}
