import { LineItem, Order, OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { logger } from '../utils/logger.utils';
import { NoOrdersFoundError } from '../errors/extendedCustom.error';


export const mapOrderAssociations = (orders: any): string[][] => {
  const associations: string[][] = [];

  if (orders.results?.length > 0) {
    orders.results.forEach((order: Order) => {
      const skuList = extractSkusFromLineItems(order.lineItems);
      if (skuList.length > 0) {
        associations.push(skuList);
      }
    });
    
    logger.info(`Successfully processed ${orders.total} orders`);
  } else {
    logger.info('No orders found');
    throw new NoOrdersFoundError();
  }

  return associations;
};


const extractSkusFromLineItems = (lineItems: LineItem[]): string[] => {
  if (!lineItems?.length) {
    return [];
  }

  return lineItems
    .map((item) => item.variant?.sku)
    .filter((sku): sku is string => sku !== undefined);
};