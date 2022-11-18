import { Response } from 'express';

class BaseError extends Error {

  public httpStatusCode: number | undefined;
  public cause: unknown | undefined = undefined;

  constructor(message: string, httpStatusCode: number | undefined = undefined, cause: unknown | undefined = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.cause = cause;

    if (httpStatusCode) {
      this.httpStatusCode = httpStatusCode;
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      httpStatusCode: this.httpStatusCode,
    };
  }

  toHttpResponseObject() {
    return {
      message: this.message
    };
  }
}

class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(message || 'You do not have enough privileges to perform this operation', 403);
  }
}

class NotAuthenticatedError extends BaseError {
  constructor(message: string) {
    super(message || 'You are not authenticated', 401);
  }
}

class ValidationError extends BaseError {
  constructor(message: string | undefined = undefined) {
    super(message || 'Validation failed', 422);
  }

  toHttpResponseObject() {
    return {
      message: this.message,
    };
  }
}

function handleErrorSecurely(error: any, res: Response) {
  console.error('ERROR', error);
  if (error instanceof BaseError) {
    res.status(error.httpStatusCode || 400).send(error.toHttpResponseObject());
  } else {
    res.status(500).send({
      message: 'Unexpected error occured. Contact developer please.',
      stack: error.stack,
    });
  }
}

export {
  BaseError,
  ForbiddenError,
  NotAuthenticatedError,
  ValidationError,
  handleErrorSecurely
};
