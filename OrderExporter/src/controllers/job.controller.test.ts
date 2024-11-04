import { Request, Response } from 'express';
import { post } from './job.controller'; // Adjust the path as necessary
import { allOrders } from '../repository/order.repository';
import { mapOrderAssociations } from '../service/order.service';
import { uploadToS3 } from '../service/s3.service';


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

});
