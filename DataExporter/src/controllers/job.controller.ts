import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { fetchOrders } from '../repository/order.repository';
import { mapOrderForMBA, mapOrderForCS } from '../service/order.service';
import { UploadCBFTrainingData, UploadCSTrainingData, uploadMBATrainingData } from '../service/s3.service';
import { OrderPagedQueryResponse, ProductPagedQueryResponse } from '@commercetools/platform-sdk';
import { writeLog } from '../service/log.service';
import { fetchProducts } from '../repository/product.repository';
import { mapCBFTrainingData } from '../service/map.service';

export const post = async (_request: Request, response: Response) => {
  // Record the start time for processing
  const startTime = Date.now();

  try {
    // Fetch orders from the repository, sorted by last modified date
    logger.info("Fetching orders...");
    const orders: OrderPagedQueryResponse = await fetchOrders({ sort: ['lastModifiedAt'] });

    // Fetch products from the repository, sorted by last modified date
    logger.info("Fetching products...");
    const products: ProductPagedQueryResponse = await fetchProducts({ sort: ['lastModifiedAt'] });

    // Map orders and products data for content-based-filtering (CBF)
    const contentBasedFilteringData: any = mapCBFTrainingData(products, orders);
    const isCBUploadSuccessful = await UploadCBFTrainingData(contentBasedFilteringData);

    // Map orders for Market Basket Analysis (MBA)
    const orderAssociationsForMBA = mapOrderForMBA(orders);
    const isMBAUploadSuccessful = await uploadMBATrainingData({ associations: orderAssociationsForMBA });

    // Map orders for customer segmentation (CS)
    const customerSegmentationOrders = mapOrderForCS(orders);
    const isCSUploadSuccessful = await UploadCSTrainingData(customerSegmentationOrders);

    // Log the results of the upload processes
    const totalOrdersProcessed = orders.results.length;
    await writeLog(
      'Uploaded Market Basket Analysis (MBA) data, Content-Based Filtering (CBF) data, and Customer Segmentation (CS) JSON files to S3 successfully',
      totalOrdersProcessed,
      startTime,
      isMBAUploadSuccessful,
      isCSUploadSuccessful,
      isCBUploadSuccessful
    );

    // Return success response with a message
    return response.status(200).json({ message: "Data upload successful" });

  } catch (error) {
    // Determine the error message based on whether it's a CustomError or a generic error
    const errorMessage = error instanceof CustomError ? error.message : 'Internal Server Error';

    // Log the error and set upload statuses to false
    await writeLog(
      errorMessage,
      0,  // No orders processed in case of error
      startTime,
      false,  // MBA upload failure
      false,  // CS upload failure
      false   // CBF upload failure
    );

    // Throw the error if it's a CustomError, else throw a generic error
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(500, 'Internal Server Error');
  }
};
