import { CustomObject, CustomObjectDraft } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import { ProcessLogData } from '../interfaces/logData.interface';

const CUSTOM_OBJECT_CONTAINER = 'cron-job-log';

export const writeLog = async (
  message: string,
  ordersProcessed: number,
  startTime: number,
  s3UploadStatus = true
): Promise<CustomObject> => {
  const logData: ProcessLogData = {
    timestamp: new Date().toISOString(),
    status: s3UploadStatus ? 'success' : 'error',
    message,
    details: {
      ordersProcessedStatus: ordersProcessed > 0,  // Set to true if orders were processed, otherwise false
      s3UploadStatus,
      duration: Date.now() - startTime,  // Duration in milliseconds
    },
  };

  // Only include ordersProcessed if the status is 'success'
  if (s3UploadStatus) {
    logData.details.ordersProcessed = ordersProcessed;
  }

  const customObjectDraft: CustomObjectDraft = {
    container: CUSTOM_OBJECT_CONTAINER,
    key: `cron-log-${Date.now()}`,
    value: logData,
  };

  const { body } = await createApiRoot()
    .customObjects()
    .post({ body: customObjectDraft })
    .execute();

  return body;
};
