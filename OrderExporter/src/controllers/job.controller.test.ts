import { Request, Response } from 'express';
import { post } from './job.controller'; // Adjust the path as necessary
import { allOrders } from '../repository/order.repository';
import { mapOrderAssociations } from '../service/order.service';
import { uploadToS3 } from '../service/s3.service';
import CustomError from '../errors/custom.error';

// Mock modules
jest.mock('../repository/order.repository', () => ({
  allOrders: jest.fn(),
}));
jest.mock('../service/order.service', () => ({
  mapOrderAssociations: jest.fn(),
}));
jest.mock('../service/s3.service', () => ({
  uploadToS3: jest.fn(),
}));
jest.mock('../utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Order Controller Integration Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn().mockReturnThis();

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {}; // No specific request body for this test
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  test('should fetch orders and upload associations to S3', async () => {
    // Arrange
    const mockOrders = { results: [{ id: 'order1' }, { id: 'order2' }] }; // Mock orders response
    (allOrders as jest.Mock).mockResolvedValue(mockOrders);
    (mapOrderAssociations as jest.Mock).mockReturnValue(['sku1', 'sku2']);
    (uploadToS3 as jest.Mock).mockResolvedValue(true);

    // Act
    await post(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(allOrders).toHaveBeenCalledWith({ sort: ['lastModifiedAt'] });
    expect(mapOrderAssociations).toHaveBeenCalledWith(mockOrders);
    expect(uploadToS3).toHaveBeenCalledWith({ associations: ['sku1', 'sku2'] });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ message: "Successfully uploaded data to S3" });
  });

  test('should throw CustomError when upload to S3 fails', async () => {
    // Arrange
    const mockOrders = { results: [{ id: 'order1' }] };
    const errorMessage = 'S3 upload failed';
    (allOrders as jest.Mock).mockResolvedValue(mockOrders);
    (mapOrderAssociations as jest.Mock).mockReturnValue(['sku1']);
    (uploadToS3 as jest.Mock).mockResolvedValue(false); // Simulate failed upload

    // Act & Assert
    await expect(post(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
      new CustomError(500, errorMessage)
    );
    expect(allOrders).toHaveBeenCalled();
    expect(mapOrderAssociations).toHaveBeenCalled();
    expect(uploadToS3).toHaveBeenCalled();
  });

  test('should throw CustomError with message "Internal Server Error" on unexpected error', async () => {
    // Arrange
    const unexpectedError = new Error('Unexpected error');
    (allOrders as jest.Mock).mockRejectedValueOnce(unexpectedError); // Simulate unexpected error in allOrders
  
    // Act & Assert
    await expect(post(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
      new CustomError(500, 'Internal Server Error')
    );
    expect(allOrders).toHaveBeenCalled();
  });

  
});
