import { CustomObject, CustomObjectDraft } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';


export const writeLogToCommercetools = async (customObjectDraft: CustomObjectDraft): Promise<CustomObject> => {
  const { body } = await createApiRoot()
    .customObjects()
    .post({ body: customObjectDraft })
    .execute();

  return body;
};
