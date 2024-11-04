import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import CustomError from '../errors/custom.error';

dotenv.config();

if (!process.env.AWS_ACCESS_KEY_ID || 
    !process.env.AWS_SECRET_ACCESS_KEY || 
    !process.env.AWS_S3_BUCKET_NAME) {
  throw new CustomError(500, 'Missing required AWS credentials in environment variables');
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export const S3_CONFIG = {
  BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  REGION: process.env.AWS_REGION || 'us-east-1'
};
