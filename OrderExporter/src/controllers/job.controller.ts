import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { fetchOrders } from '../repository/order.repository';
import { mapOrderAssociations, mapOrderToCsv } from '../service/order.service';
import { uploadJsonToS3, uploadCsvToS3 } from '../service/s3.service';
import { OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { writeLog } from '../service/log.service';

export const post = async (_request: Request, response: Response) => {
  const startTime = Date.now();

  try {
    // Fetch orders
    logger.info("Fetching orders...");
    const orders: OrderPagedQueryResponse = await fetchOrders({ sort: ['lastModifiedAt'] });

    // Map orders to necessary formats
    const orderAssociations = mapOrderAssociations(orders);
    const isJsonUploadSuccessful = await uploadJsonToS3({ associations: orderAssociations });

    const orderCsvData = mapOrderToCsv(orders);
    const isCsvUploadSuccessful = await uploadCsvToS3(orderCsvData);

    // Log upload success or failure
    const totalOrdersProcessed = orders.results.length;
    await writeLog(
      'Uploaded Order Associations JSON and Order CSV data to S3',
      totalOrdersProcessed,
      startTime,
      isJsonUploadSuccessful,
      isCsvUploadSuccessful
    );

    return response.status(200).json({
      message: 'Successfully uploaded Order Associations JSON and Order CSV data to S3',
    });

  } catch (error) {
    const errorMessage = error instanceof CustomError ? error.message : 'Internal Server Error';

    // Log error with both upload statuses set to false
    await writeLog(
      errorMessage,
      0,  // No orders processed on error
      startTime,
      false,  // JSON upload failure
      false   // CSV upload failure
    );

    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(500, 'Internal Server Error');
  }
};