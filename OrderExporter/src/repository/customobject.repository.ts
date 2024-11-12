import { CustomObject, CustomObjectDraft } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import { ProcessLogData } from '../interfaces/logData.interface';

const CUSTOM_OBJECT_CONTAINER = 'cron-job-log';

export const writeLogToCommercetools = async (customObjectDraft: CustomObjectDraft): Promise<CustomObject> => {
  const { body } = await createApiRoot()
    .customObjects()
    .post({ body: customObjectDraft })
    .execute();

  return body;
};
