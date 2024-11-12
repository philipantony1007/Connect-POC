import { Request, Response } from 'express';
import { post } from './job.controller';
import { fetchOrders } from '../repository/order.repository';
import { mapOrderAssociations, mapOrderToCsv } from '../service/order.service';
import { uploadJsonToS3, uploadCsvToS3 } from '../service/s3.service';
import { writeLog } from '../service/log.service';
import CustomError from '../errors/custom.error';

jest.mock('../repository/order.repository');
jest.mock('../service/order.service');
jest.mock('../service/s3.service');
jest.mock('../service/log.service');
jest.mock('../utils/logger.utils');

describe('Order Controller - post function', () => {
  let response: Partial<Response>;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should upload JSON and CSV data to S3 and log success', async () => {
    const ordersMock = { results: [{ id: 'order1' }, { id: 'order2' }] };
    const mappedAssociations = [{ id: 'assoc1' }];
    const csvData = [['header1', 'header2'], ['row1', 'row2']];

    (fetchOrders as jest.Mock).mockResolvedValue(ordersMock);
    (mapOrderAssociations as jest.Mock).mockReturnValue(mappedAssociations);
    (mapOrderToCsv as jest.Mock).mockReturnValue(csvData);
    (uploadJsonToS3 as jest.Mock).mockResolvedValue(true);
    (uploadCsvToS3 as jest.Mock).mockResolvedValue(true);

    await post({} as Request, response as Response);

    expect(fetchOrders).toHaveBeenCalled();
    expect(mapOrderAssociations).toHaveBeenCalledWith(ordersMock);
    expect(mapOrderToCsv).toHaveBeenCalledWith(ordersMock);
    expect(uploadJsonToS3).toHaveBeenCalledWith({ associations: mappedAssociations });
    expect(uploadCsvToS3).toHaveBeenCalledWith(csvData);
    expect(writeLog).toHaveBeenCalledWith(
      'Uploaded Order Associations JSON and Order CSV data to S3',
      2, // totalOrdersProcessed based on ordersMock
      expect.any(Number),
      true,
      true
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Successfully uploaded Order Associations JSON and Order CSV data to S3',
    });
  });

  it('should handle error and log failure', async () => {
    const error = new Error('Fetching orders failed');
    (fetchOrders as jest.Mock).mockRejectedValue(error);

    try {
      await post({} as Request, response as Response);
    } catch (err:any) {
      expect(err).toBeInstanceOf(CustomError);
      expect(err.message).toBe('Internal Server Error');
    }

    expect(writeLog).toHaveBeenCalledWith(
      'Internal Server Error',
      0, // No orders processed due to error
      expect.any(Number),
      false,
      false
    );
  });

  it('should throw CustomError if CustomError is thrown in try block', async () => {
    const customError = new CustomError(400, 'Custom Error');
    (fetchOrders as jest.Mock).mockRejectedValue(customError);

    await expect(post({} as Request, response as Response)).rejects.toThrow(CustomError);
    expect(writeLog).toHaveBeenCalledWith(
      'Custom Error',
      0, // No orders processed on error
      expect.any(Number),
      false,
      false
    );
  });
});
