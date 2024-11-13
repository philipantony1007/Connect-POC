import CustomError from './custom.error';

export class NoOrdersFoundError extends CustomError {
  constructor() {
    super(404, 'No orders found, cron job skipped, no data uploaded to S3');
  }
}

export class S3UploadError extends CustomError {
  constructor(originalError: any) {
    super(500, `Failed to upload data to S3: ${originalError.message || originalError}`);
  }
}