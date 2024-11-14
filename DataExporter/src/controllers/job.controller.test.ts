import { Request, Response } from 'express';
import { post } from './job.controller';
import { fetchOrders } from '../repository/order.repository';
import { mapOrderForMBA, mapOrderForCS } from '../service/order.service';
import { UploadCBFTrainingData, UploadCSTrainingData, uploadMBATrainingData } from '../service/s3.service';
import { writeLog } from '../service/log.service';
import CustomError from '../errors/custom.error';
import { fetchProducts } from '../repository/product.repository';
import { OrderPagedQueryResponse, ProductPagedQueryResponse } from '@commercetools/platform-sdk';

jest.mock('../repository/order.repository');
jest.mock('../service/order.service');
jest.mock('../service/s3.service');
jest.mock('../service/log.service');
jest.mock('../utils/logger.utils');
jest.mock('../repository/product.repository');
jest.mock('../service/map.service');

describe('Order Controller - post function', () => {
  let response: Partial<Response>;

  // Sample mock responses
  const mockOrderResponse: any = {
    count: 2,
    total: 2,
    offset: 0,
    results: [
      {
        id: 'order1',
        version: 1,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        lineItems: [
          { 
            id: 'lineItem1', 
            productId: 'product1', 
            name: { 'en-US': 'Product 1' } 
          }
        ]
      },
      {
        id: 'order2',
        version: 1,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        lineItems: [
          { 
            id: 'lineItem2', 
            productId: 'product2', 
            name: { 'en-US': 'Product 2' } 
          }
        ]
      }
    ]
  } as any;

  const mockProductResponse: any = {
    count: 2,
    total: 2,
    offset: 0,
    results: [
      {
        id: 'product1',
        version: 1,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        name: { 'en-US': 'Product 1' }
      },
      {
        id: 'product2',
        version: 1,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        name: { 'en-US': 'Product 2' }
      }
    ]
  } as any;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // Existing test cases...

  it('should successfully process orders and upload data', async () => {
    // Mock all necessary service functions
    (fetchOrders as jest.Mock).mockResolvedValue(mockOrderResponse);
    (fetchProducts as jest.Mock).mockResolvedValue(mockProductResponse);

    // Mock mapping functions
    jest.mock('../service/map.service', () => ({
      mapCBFTrainingData: jest.fn().mockReturnValue({}),
    }));

    // Mock the S3 upload functions to resolve successfully
    (UploadCBFTrainingData as jest.Mock).mockResolvedValue(true);
    (uploadMBATrainingData as jest.Mock).mockResolvedValue(true);
    (UploadCSTrainingData as jest.Mock).mockResolvedValue(true);

    // Mock mapping functions in order service
    (mapOrderForMBA as jest.Mock).mockReturnValue({});
    (mapOrderForCS as jest.Mock).mockReturnValue({});

    // Call the post function
    await post({} as Request, response as Response);

    // Check if response.status and response.json were called correctly
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ message: "Data upload successful" });

    // Check if writeLog was called with the correct parameters
    expect(writeLog).toHaveBeenCalledWith(
      'Uploaded Market Basket Analysis (MBA) data, Content-Based Filtering (CBF) data, and Customer Segmentation (CS) JSON files to S3 successfully',
      2, // Number of orders processed
      expect.any(Number), // Start time (since it's dynamic, expect a number)
      true, // isMBAUploadSuccessful
      true, // isCSUploadSuccessful
      true  // isCBUploadSuccessful
    );
  });

  // Additional test cases for edge cases
  it('should handle empty orders gracefully', async () => {
    // Mock empty orders response
    const emptyOrderResponse: any = {
      count: 0,
      total: 0,
      offset: 0,
      results: []
    } as any;

    (fetchOrders as jest.Mock).mockResolvedValue(emptyOrderResponse);
    (fetchProducts as jest.Mock).mockResolvedValue(mockProductResponse);

    // Mock S3 upload functions
    (UploadCBFTrainingData as jest.Mock).mockResolvedValue(true);
    (uploadMBATrainingData as jest.Mock).mockResolvedValue(true);
    (UploadCSTrainingData as jest.Mock).mockResolvedValue(true);

    // Mock mapping functions
    (mapOrderForMBA as jest.Mock).mockReturnValue({});
    (mapOrderForCS as jest.Mock).mockReturnValue({});

    await post({} as Request, response as Response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(writeLog).toHaveBeenCalledWith(
      expect.any(String),
      0, // No orders processed
      expect.any(Number),
      expect.any(Boolean),
      expect.any(Boolean),
      expect.any(Boolean)
    );
  });
});