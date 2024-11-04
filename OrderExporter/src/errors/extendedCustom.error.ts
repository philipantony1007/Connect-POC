import CustomError from '../errors/custom.error';

export class NoOrdersFoundError extends CustomError {
  constructor() {
    super(404, 'No orders found');
  }
}

export class S3UploadError extends CustomError {
  constructor(originalError: any) {
    super(500, `Failed to upload data to S3: ${originalError.message || originalError}`);
  }
}
