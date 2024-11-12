import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { fetchOrders } from '../repository/order.repository';
import { mapOrderForMBA, mapOrderForCS } from '../service/order.service';
import { UploadCBFTrainingData, UploadCSTrainingData, uploadMBATrainingData } from '../service/s3.service';
import { OrderPagedQueryResponse, ProductPagedQueryResponse } from '@commercetools/platform-sdk';
import { writeLog } from '../service/log.service';
import { fetchProducts } from '../repository/product.repository';
import { mapProductData } from '../service/product.service';
import { mapCustomer } from '../service/customer.service';
import { mapCombinedData } from '../service/map.service';

export const post = async (_request: Request, response: Response) => {
  const startTime = Date.now();

  try {
    // Fetch orders
    logger.info("Fetching orders...");
    const orders: OrderPagedQueryResponse = await fetchOrders({ sort: ['lastModifiedAt'] });
    //const customers = mapCustomer(orders)
    const product:ProductPagedQueryResponse = await fetchProducts({ sort: ['lastModifiedAt'] });
    const mappeddata:any = mapCombinedData(product,orders)
    const isCBFSuccessful = await UploadCBFTrainingData(mappeddata);




    // Map orders to necessary formats
    // const orderAssociations = mapOrderForMBA(orders);
    // const isJsonUploadSuccessful = await uploadMBATrainingData({ associations: orderAssociations });

  

    // const CBFOrder = mapOrderForCS(orders);
    // const isCsvUploadSuccessful = await UploadCSTrainingData(CBFOrder);

    // Log upload success or failure
    // const totalOrdersProcessed = orders.results.length;
    // await writeLog(
    //   'Uploaded Order Associations JSON and Order CSV data to S3',
    //   totalOrdersProcessed,
    //   startTime,
    //   isJsonUploadSuccessful,
    //   isCsvUploadSuccessful
    // );

    return response.status(200).json(
      isCBFSuccessful
    );

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