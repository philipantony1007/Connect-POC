import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_CONFIG } from '../utils/aws.utils';
import { logger } from '../utils/logger.utils';
import { S3UploadError } from '../errors/extendedCustom.error';



export async function uploadToS3(data: any): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const filename = `${timestamp}.json`;

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.BUCKET_NAME,
      Key: `apriori/${filename}`,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
    });

    await s3Client.send(command);
    
    logger.info("Successfully uploaded data to S3");
    return true;
  } catch (error) {
    logger.error('Error uploading to S3:', error);
    throw new S3UploadError(error);
  }
}
