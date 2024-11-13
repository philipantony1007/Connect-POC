import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG } from '../utils/aws.utils';
import { logger } from '../utils/logger.utils';
import { S3UploadError } from '../errors/extendedCustom.error';

// Utility function for uploading JSON data to S3
async function uploadToS3(data: any, folder: string): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const filename = `${timestamp}.json`;

    // Set content type for JSON
    const contentType = 'application/json';
    const body = JSON.stringify(data);  // Convert data to JSON string

    // Create and send the S3 command to upload the data
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: `${folder}/${filename}`,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);
    logger.info(`Successfully uploaded JSON data to S3`);
    return true;
  } catch (error) {
    logger.error(`Error uploading JSON to S3:`, error);
    throw new S3UploadError(error);
  }
}

// Function to upload JSON data to S3 (apriori folder)
export async function uploadMBATrainingData(data: any): Promise<boolean> {
  return uploadToS3(data, 'apriori');
}

// Function to upload JSON data to S3 (customer-segmentation folder)
export async function UploadCSTrainingData(order: any): Promise<boolean> {
  return uploadToS3(order, 'customer-segmentation');
}

export async function UploadCFTrainingData(product: any): Promise<boolean> {
  return uploadToS3(product, 'collaborative-filering');
}

