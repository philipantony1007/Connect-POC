export interface ProcessLogData {
    timestamp: string;
    status: 'success' | 'error';
    message: string;
    details: {
      ordersProcessedStatus: boolean;  // This is now always included
      ordersProcessed?: number;
      s3UploadStatus: boolean;
      duration: number;  // Duration in milliseconds
    };
  }
  