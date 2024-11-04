import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { allOrders } from '../repository/order.repository';
import { mapOrderAssociations } from '../service/order.service';
import { OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { uploadToS3 } from '../service/s3.service';


export const post = async (_request: Request, response: Response) => {
  try {
    // Fetch the orders
    logger.info("Fetching orders...");

    const orders: OrderPagedQueryResponse = await allOrders({ sort: ['lastModifiedAt'] });

    
    // Process orders to get SKU associations
    const associations = mapOrderAssociations(orders);

    
    const isUploaded = await uploadToS3({ associations });
    
    if (isUploaded) {
      response.status(200).json({ message: "Successfully uploaded data to S3" });
    } else {
      throw new CustomError(500, 'S3 upload failed');
    }
  } catch (error) {
    if (error instanceof CustomError) {
      logger.error('Error 0 orders found:');
      throw error;
    }
    throw new CustomError(500, 'Internal Server Error');
  }
};
