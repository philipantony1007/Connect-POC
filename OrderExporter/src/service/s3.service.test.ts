// event/src/service/s3.service.test.ts

import { uploadToS3 } from './s3.service';
import { s3Client } from '../utils/aws.utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3UploadError } from '../errors/extendedCustom.error';
import { logger } from '../utils/logger.utils';

jest.mock('../utils/aws.utils', () => ({
  s3Client: {
    send: jest.fn(),
  },
  S3_CONFIG: {
    BUCKET_NAME: 'test-bucket',
  },
}));

jest.mock('../utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('uploadToS3', () => {
  const mockData = { key: 'value' };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mock calls
  });

  it('should upload data to S3 successfully', async () => {
    (s3Client.send as jest.Mock).mockResolvedValueOnce({}); // Mock successful upload response

    const result = await uploadToS3(mockData);

    expect(result).toBe(true);
    expect(s3Client.send).toHaveBeenCalledTimes(1);
    expect(s3Client.send).toHaveBeenCalledWith(
      expect.any(PutObjectCommand) // Check that PutObjectCommand was used
    );
    expect(logger.info).toHaveBeenCalledWith("Successfully uploaded data to S3");
  });

  it('should throw S3UploadError when upload fails', async () => {
    const errorMessage = 'Upload failed';
    (s3Client.send as jest.Mock).mockRejectedValueOnce(new Error(errorMessage)); // Mock failed upload response

    await expect(uploadToS3(mockData)).rejects.toThrow(S3UploadError);
    expect(logger.error).toHaveBeenCalledWith('Error uploading to S3:', expect.any(Error));
  });
});
