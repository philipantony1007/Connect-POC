import { writeLogToCommercetools } from '../repository/customobject.repository';
import { ProcessLogData } from '../interfaces/logData.interface';
import { prepareLogData, writeLog } from './log.service';

jest.mock('../repository/customobject.repository'); // Mock the repository function

describe('Log Service', () => {
  const mockStartTime = Date.now();
  const mockMessage = "Test cron job log message";
  const mockTotalOrdersProcessed = 50;

  describe('prepareLogData', () => {
    it('should return success status and include totalOrdersProcessed when all uploads are successful', () => {
      const logData: ProcessLogData = prepareLogData(
        mockMessage,
        mockTotalOrdersProcessed,
        mockStartTime,
        true,
        true,
        true
      );

      expect(logData.status).toBe('success');
      expect(logData.details.totalOrdersProcessed).toBe(mockTotalOrdersProcessed);
      expect(logData.details.durationInMilliseconds).toBeGreaterThanOrEqual(0);
    });

    it('should return failed status and exclude totalOrdersProcessed when any upload fails', () => {
      const logData: ProcessLogData = prepareLogData(
        mockMessage,
        mockTotalOrdersProcessed,
        mockStartTime,
        true,
        false,
        true
      );

      expect(logData.status).toBe('failed');
      expect(logData.details.totalOrdersProcessed).toBeUndefined();
      expect(logData.details.durationInMilliseconds).toBeGreaterThanOrEqual(0);
    });

    it('should include the message and timestamp in the log data', () => {
      const logData: ProcessLogData = prepareLogData(
        mockMessage,
        mockTotalOrdersProcessed,
        mockStartTime
      );

      expect(logData.message).toBe(mockMessage);
      expect(new Date(logData.timestamp).getTime()).not.toBeNaN(); // Checks if timestamp is valid
    });
  });

  describe('writeLog', () => {
    it('should call writeLogToCommercetools with correct CustomObjectDraft data', async () => {
      const isMBAUploadSuccessful = true;
      const isCSUploadSuccessful = true;
      const isCBFUploadSuccessful = true;

      await writeLog(
        mockMessage,
        mockTotalOrdersProcessed,
        mockStartTime,
        isMBAUploadSuccessful,
        isCSUploadSuccessful,
        isCBFUploadSuccessful
      );

      expect(writeLogToCommercetools).toHaveBeenCalledWith(
        expect.objectContaining({
          container: 'cron-job-log',
          key: expect.stringContaining('cron-log-'), // Check key format
          value: expect.objectContaining({
            message: mockMessage,
            status: 'success',
            details: expect.objectContaining({
              totalOrdersProcessed: mockTotalOrdersProcessed,
              durationInMilliseconds: expect.any(Number),
            }),
          }),
        })
      );
    });

    it('should call writeLogToCommercetools with failed status if any upload fails', async () => {
      const isMBAUploadSuccessful = true;
      const isCSUploadSuccessful = false;
      const isCBFUploadSuccessful = true;

      await writeLog(
        mockMessage,
        mockTotalOrdersProcessed,
        mockStartTime,
        isMBAUploadSuccessful,
        isCSUploadSuccessful,
        isCBFUploadSuccessful
      );

      expect(writeLogToCommercetools).toHaveBeenCalledWith(
        expect.objectContaining({
          container: 'cron-job-log',
          value: expect.objectContaining({
            status: 'failed',
            details: expect.not.objectContaining({
              totalOrdersProcessed: mockTotalOrdersProcessed,
            }),
          }),
        })
      );
    });
  });
});
