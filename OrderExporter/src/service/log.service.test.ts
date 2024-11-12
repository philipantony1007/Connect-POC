import { prepareLogData, writeLog } from './log.service';
import { ProcessLogData } from '../interfaces/logData.interface';
import { writeLogToCommercetools } from '../repository/customobject.repository';
import { CustomObjectDraft } from '@commercetools/platform-sdk';

jest.mock('../repository/customobject.repository');

describe('prepareLogData', () => {
  it('should prepare log data with success status when uploads are successful', () => {
    const message = 'Process completed';
    const totalOrdersProcessed = 5;
    const startTime = Date.now() - 2000;

    const result = prepareLogData(message, totalOrdersProcessed, startTime, true, true);

    expect(result).toEqual({
      timestamp: expect.any(String),
      status: 'success',
      message,
      details: {
        durationInMilliseconds: expect.any(Number),
        totalOrdersProcessed,
      },
    });
    expect(result.details.durationInMilliseconds).toBeGreaterThanOrEqual(2000);
  });

  it('should prepare log data with failed status when any upload fails', () => {
    const message = 'Process encountered errors';
    const totalOrdersProcessed = 5;
    const startTime = Date.now() - 1500;

    const result = prepareLogData(message, totalOrdersProcessed, startTime, false, true);

    expect(result).toEqual({
      timestamp: expect.any(String),
      status: 'failed',
      message,
      details: {
        durationInMilliseconds: expect.any(Number),
      },
    });
    expect(result.details.totalOrdersProcessed).toBeUndefined();
  });

  it('should include totalOrdersProcessed only when both uploads are successful', () => {
    const message = 'Orders processed successfully';
    const totalOrdersProcessed = 3;
    const startTime = Date.now() - 1000;

    const successLog = prepareLogData(message, totalOrdersProcessed, startTime, true, true);
    const failureLog = prepareLogData(message, totalOrdersProcessed, startTime, true, false);

    expect(successLog.details.totalOrdersProcessed).toBe(totalOrdersProcessed);
    expect(failureLog.details.totalOrdersProcessed).toBeUndefined();
  });
});

describe('writeLog', () => {
    it('should call writeLogToCommercetools with the correct custom object draft', async () => {
        const message = 'Processing complete';
        const totalOrdersProcessed = 10;
        const startTime = Date.now() - 5000;
        const isOrderAssociationUploadSuccessful = true;
        const isCsvUploadSuccessful = true;
    
        await writeLog(message, totalOrdersProcessed, startTime, isOrderAssociationUploadSuccessful, isCsvUploadSuccessful);
    
        const expectedLogData: ProcessLogData = prepareLogData(message, totalOrdersProcessed, startTime, isOrderAssociationUploadSuccessful, isCsvUploadSuccessful);
        const expectedCustomObjectDraft: CustomObjectDraft = {
          container: 'cron-job-log',
          key: expect.stringMatching(/^cron-log-\d+$/),
          value: {
            status: 'success',
            message: 'Processing complete',
            timestamp: expect.any(String),
            details: {
              durationInMilliseconds: expect.any(Number),
              totalOrdersProcessed: totalOrdersProcessed,
            },
          },
        };
    
        expect(writeLogToCommercetools).toHaveBeenCalledWith(expectedCustomObjectDraft);
      });

  it('should handle failed uploads and call writeLogToCommercetools with failed status', async () => {
    const message = 'Processing encountered an error';
    const totalOrdersProcessed = 7;
    const startTime = Date.now() - 3000;

    await writeLog(message, totalOrdersProcessed, startTime, true, false);

    const expectedLogData: ProcessLogData = prepareLogData(message, totalOrdersProcessed, startTime, true, false);
    const expectedCustomObjectDraft: CustomObjectDraft = {
      container: 'cron-job-log',
      key: expect.stringMatching(/^cron-log-\d+$/),
      value: expectedLogData,
    };

    expect(writeLogToCommercetools).toHaveBeenCalledWith(expectedCustomObjectDraft);
  });
});
