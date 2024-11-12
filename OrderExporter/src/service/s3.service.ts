import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG } from '../utils/aws.utils';
import { logger } from '../utils/logger.utils';
import { S3UploadError } from '../errors/extendedCustom.error';

// Utility function for uploading any data type to S3
async function uploadToS3(data: any, fileType: 'json' | 'csv', folder: string): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const filename = `${timestamp}.${fileType}`;

    const contentType = fileType === 'json' ? 'application/json' : 'text/csv';
    const body = fileType === 'json' ? JSON.stringify(data) : data.map((row: string[]) => row.join(',')).join('\n');

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: `${folder}/${filename}`,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);
    logger.info(`Successfully uploaded ${fileType.toUpperCase()} data to S3`);
    return true;
  } catch (error) {
    logger.error(`Error uploading ${fileType.toUpperCase()} to S3:`, error);
    throw new S3UploadError(error);
  }
}

// Function to upload JSON to S3
export async function uploadJsonToS3(data: any): Promise<boolean> {
  return uploadToS3(data, 'json', 'apriori');
}

// Function to upload CSV to S3
export async function uploadCsvToS3(data: string[][]): Promise<boolean> {
  return uploadToS3(data, 'csv', 'customer-segmentation/training-data');
}
