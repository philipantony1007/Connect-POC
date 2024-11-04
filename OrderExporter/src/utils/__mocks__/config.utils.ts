export const readConfiguration = jest.fn(() => ({
  CTP_CLIENT_ID: 'mockedClientId',
  CTP_CLIENT_SECRET: 'mockedClientSecret',
  CTP_PROJECT_KEY: 'mockedProjectKey',
  CTP_SCOPE: 'mockedScope',
  CTP_REGION: 'mockedRegion',
  AWS_ACCESS_KEY_ID:"",
  AWS_SECRET_ACCESS_KEY:"",
  AWS_S3_BUCKET_NAME:""
}));
