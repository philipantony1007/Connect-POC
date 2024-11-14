import { s3Client, S3_CONFIG } from '../utils/aws.utils';
import { uploadMBATrainingData, UploadCSTrainingData, UploadCBFTrainingData } from './s3.service';
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

  describe('uploadMBATrainingData', () => {
    it('should upload JSON data to S3 apriori folder with correct parameters', async () => {
      const jsonData = { key: 'value' };
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockResolvedValueOnce({});

      const result = await uploadMBATrainingData(jsonData);

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

      await expect(uploadMBATrainingData(jsonData)).rejects.toThrow(S3UploadError);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error uploading JSON to S3:'), expect.any(Error));
    });
  });

  describe('UploadCSTrainingData', () => {
    it('should upload JSON data to S3 customer-segmentation folder with correct parameters', async () => {
      const jsonData = { orderId: '123', items: [] };
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockResolvedValueOnce({});

      const result = await UploadCSTrainingData(jsonData);

      expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      const putCommand = mockSend.mock.calls[0][0] as PutObjectCommand;
      expect(putCommand.input).toMatchObject({
        Bucket: 'my-test-bucket',
        Key: expect.stringContaining('customer-segmentation/'),
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json',
      });
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Successfully uploaded JSON data to S3'));
      expect(result).toBe(true);
    });

    it('should throw S3UploadError on failure', async () => {
      const jsonData = { orderId: '123', items: [] };
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockRejectedValueOnce(new Error('S3 upload failed'));

      await expect(UploadCSTrainingData(jsonData)).rejects.toThrow(S3UploadError);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error uploading JSON to S3:'), expect.any(Error));
    });
  });

  describe('UploadCBFTrainingData', () => {
    it('should upload JSON data to S3 content-based-filtering folder with correct parameters', async () => {
      const jsonData = { productId: '123', features: {} };
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockResolvedValueOnce({});

      const result = await UploadCBFTrainingData(jsonData);

      expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      const putCommand = mockSend.mock.calls[0][0] as PutObjectCommand;
      expect(putCommand.input).toMatchObject({
        Bucket: 'my-test-bucket',
        Key: expect.stringContaining('content-based-filtering/'),
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json',
      });
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Successfully uploaded JSON data to S3'));
      expect(result).toBe(true);
    });

    it('should throw S3UploadError on failure', async () => {
      const jsonData = { productId: '123', features: {} };
      const mockSend = s3Client.send as jest.Mock;

      mockSend.mockRejectedValueOnce(new Error('S3 upload failed'));

      await expect(UploadCBFTrainingData(jsonData)).rejects.toThrow(S3UploadError);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error uploading JSON to S3:'), expect.any(Error));
    });
  });
});