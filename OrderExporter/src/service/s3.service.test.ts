import { s3Client } from '../utils/aws.utils';
import { uploadJsonToS3, uploadCsvToS3 } from './s3.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../utils/logger.utils';
import { S3UploadError } from '../errors/extendedCustom.error';

jest.mock('../utils/aws.utils', () => ({
  s3Client: { send: jest.fn() },
  S3_CONFIG: { BUCKET_NAME: 'my-test-bucket' }
}));
jest.mock('../utils/logger.utils');

describe('S3 Upload Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadJsonToS3', () => {
    it('should upload JSON data to S3 with correct parameters', async () => {
      const jsonData = { key: 'value' };
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockResolvedValueOnce({});

      const result = await uploadJsonToS3(jsonData);

      expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      const putCommand = mockSend.mock.calls[0][0] as PutObjectCommand;
      expect(putCommand.input).toMatchObject({
        Bucket: 'my-test-bucket',
        Key: expect.stringContaining('apriori/'),
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json',
      });
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Successfully uploaded JSON data to S3'));
      expect(result).toBe(true);
    });

    it('should throw S3UploadError on failure', async () => {
      const jsonData = { key: 'value' };
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockRejectedValueOnce(new Error('S3 upload failed'));

      await expect(uploadJsonToS3(jsonData)).rejects.toThrow(S3UploadError);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error uploading JSON to S3:'), expect.any(Error));
    });
  });

  describe('uploadCsvToS3', () => {
    it('should upload CSV data to S3 with correct parameters', async () => {
      const csvData = [['header1', 'header2'], ['row1col1', 'row1col2']];
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockResolvedValueOnce({});

      const result = await uploadCsvToS3(csvData);

      expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      const putCommand = mockSend.mock.calls[0][0] as PutObjectCommand;
      expect(putCommand.input).toMatchObject({
        Bucket: 'my-test-bucket',
        Key: expect.stringContaining('customer-segmentation/training-data/'),
        Body: 'header1,header2\nrow1col1,row1col2',
        ContentType: 'text/csv',
      });
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Successfully uploaded CSV data to S3'));
      expect(result).toBe(true);
    });

    it('should throw S3UploadError on failure', async () => {
      const csvData = [['header1', 'header2'], ['row1col1', 'row1col2']];
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockRejectedValueOnce(new Error('S3 upload failed'));

      await expect(uploadCsvToS3(csvData)).rejects.toThrow(S3UploadError);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error uploading CSV to S3:'), expect.any(Error));
    });
  });
});
