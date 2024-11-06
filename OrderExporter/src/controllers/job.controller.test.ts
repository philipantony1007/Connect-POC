import { Request, Response } from 'express';
import { post } from './job.controller';
import { allOrders } from '../repository/order.repository';
import { uploadToS3 } from '../service/s3.service';
import { writeLog } from '../repository/customobject.repository';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils'

// Mock dependencies
jest.mock('../repository/order.repository');
jest.mock('../service/s3.service');
jest.mock('../repository/customobject.repository');
jest.mock('../utils/logger.utils');

describe('post', () => {
  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mock calls
  });

  it('should successfully fetch orders, upload to S3, and write a success log', async () => {
    const mockOrders: any = {
      results: [{ id: 'order1' }, { id: 'order2' }],
      count: 2,
    };

    (allOrders as jest.Mock).mockResolvedValueOnce(mockOrders);
    (uploadToS3 as jest.Mock).mockResolvedValueOnce(true);
    const successMessage = 'Successfully uploaded data to S3';

    await post(mockRequest, mockResponse);

    expect(allOrders).toHaveBeenCalledTimes(1);
    expect(uploadToS3).toHaveBeenCalledWith({ associations: expect.anything() });
    expect(writeLog).toHaveBeenCalledWith(successMessage, mockOrders.results.length, expect.any(Number));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: successMessage });
    expect(logger.info).toHaveBeenCalledWith('Fetching orders...');
  });

  it('should handle S3 upload failure and log an error', async () => {
    const mockOrders: any = {
      results: [{ id: 'order1' }],
      count: 1,
    };

    (allOrders as jest.Mock).mockResolvedValueOnce(mockOrders);
    (uploadToS3 as jest.Mock).mockResolvedValueOnce(false); // Simulate S3 upload failure
    const errorMessage = 'S3 upload failed';

    await expect(post(mockRequest, mockResponse)).rejects.toThrow(CustomError);

    expect(allOrders).toHaveBeenCalledTimes(1);
    expect(uploadToS3).toHaveBeenCalledWith({ associations: expect.anything() });
    expect(writeLog).toHaveBeenCalledWith(errorMessage, 0, expect.any(Number), false);
    expect(logger.error).toHaveBeenCalledWith('Error 0 orders found:', errorMessage);
  });

  it('should handle errors when fetching orders fails', async () => {
    const fetchError = new CustomError(500, 'Internal Server Error');
    (allOrders as jest.Mock).mockRejectedValueOnce(fetchError);

    await expect(post(mockRequest, mockResponse)).rejects.toThrow(fetchError);

    expect(allOrders).toHaveBeenCalledTimes(1);
    expect(uploadToS3).not.toHaveBeenCalled();
    expect(writeLog).toHaveBeenCalledWith(fetchError.message, 0, expect.any(Number), false);
    expect(logger.error).toHaveBeenCalledWith('Error 0 orders found:', fetchError.message);
  });
});
