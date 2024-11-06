import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { allOrders } from '../repository/order.repository';
import { mapOrderAssociations } from '../service/order.service';
import { OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { uploadToS3 } from '../service/s3.service';
import { writeLog } from '../repository/customobject.repository';



export const post = async (_request: Request, response: Response) => {
  const startTime = Date.now();
  try {
    // Fetch the orders
    logger.info("Fetching orders...");
    const orders: OrderPagedQueryResponse = await allOrders({ sort: ['lastModifiedAt'] });
    //const orders:any = []
    const associations = mapOrderAssociations(orders);

    const successMessage = 'Successfully uploaded data to S3';
    
    const isUploaded = await uploadToS3({ associations });

    if (isUploaded) {
      // Write log when the S3 upload is successful
      await writeLog(
        successMessage, 
        orders.results.length, // Include order count on success
        startTime
      );

      response.status(200).json({ message: successMessage });
    } else {
      throw new CustomError(500, 'S3 upload failed');
    }
  } catch (error) {
    // Only include the error message and other details, without ordersProcessed on error
    await writeLog(
      error instanceof CustomError ? error.message : 'Internal Server Error', // Message from the error
      0, // No orders processed on error
      startTime,
      false // S3 upload status is false on error
    );

    if (error instanceof CustomError) {
      logger.error('Error 0 orders found:', error.message);
      throw error;
    }
    throw new CustomError(500, 'Internal Server Error');
  }
};