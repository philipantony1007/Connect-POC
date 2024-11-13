import { ProcessLogData } from '../interfaces/logData.interface';
import { CustomObjectDraft } from '@commercetools/platform-sdk';
import { writeLogToCommercetools } from '../repository/customobject.repository';

const CUSTOM_OBJECT_CONTAINER = 'cron-job-log';

export const prepareLogData = (
  message: string,
  totalOrdersProcessed: number,
  startTime: number,
  isMBAUploadSuccessful: boolean = false,
  isCSUploadSuccessful: boolean = false,
  isCBFUploadSuccessful: boolean = false
): ProcessLogData => {
  const logData: ProcessLogData = {
    timestamp: new Date().toISOString(),
    status: isMBAUploadSuccessful && isCSUploadSuccessful && isCBFUploadSuccessful ? 'success' : 'failed',
    message,
    details: {
      durationInMilliseconds: Date.now() - startTime, // Ensure duration is always included
    },
  };

  // Only include totalOrdersProcessed if all uploads were successful
  if (isMBAUploadSuccessful && isCSUploadSuccessful && isCBFUploadSuccessful) {
    logData.details.totalOrdersProcessed = totalOrdersProcessed;
  }

  return logData;
};

export const writeLog = async (
  message: string,
  totalOrdersProcessed: number,
  startTime: number,
  isMBAUploadSuccessful: boolean = false,
  isCSUploadSuccessful: boolean = false,
  isCBFUploadSuccessful: boolean = false
): Promise<void> => {
  const logData = prepareLogData(message, totalOrdersProcessed, startTime, isMBAUploadSuccessful, isCSUploadSuccessful, isCBFUploadSuccessful);

  const customObjectDraft: CustomObjectDraft = {
    container: CUSTOM_OBJECT_CONTAINER,
    key: `cron-log-${Date.now()}`,
    value: logData,
  };

  // Call the repository function to save the log to Commercetools
  await writeLogToCommercetools(customObjectDraft);
};
