import { LineItem, Order, OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { NoOrdersFoundError } from '../errors/extendedCustom.error';

export const mapOrderForMBA = (orders: OrderPagedQueryResponse): string[][] => {
  const associations: string[][] = [];

  if (orders.results?.length > 0) {
    orders.results.forEach((order: Order) => {
      const skuList = extractSkusFromLineItems(order.lineItems);
      if (skuList.length > 0) {
        associations.push(skuList);
      }
    });
  } else {
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




export const mapOrderForCS = (orders: OrderPagedQueryResponse): Record<string, { Quantity: string, UnitPrice: string, TaxAmount: string }[]> => {
  const associations: Record<string, { Quantity: string, UnitPrice: string, TaxAmount: string }[]> = {};

  if (orders.results?.length > 0) {
    orders.results.forEach((order: Order) => {
      // Use SalesOrderNumber or fall back to order id if missing
      const salesOrderNumber = order.orderNumber ? order.orderNumber : order.id;

      order.lineItems.forEach((item) => {
        const quantity = item.quantity.toString();
        const unitPrice = (item.price.value.centAmount / 100).toFixed(2);
        const taxAmount = ((item.taxedPrice?.totalTax?.centAmount ?? 0) / 100).toFixed(4);

        // Create or append to the array for the SalesOrderNumber
        if (!associations[salesOrderNumber]) {
          associations[salesOrderNumber] = [];
        }

        associations[salesOrderNumber].push({
          Quantity: quantity,
          UnitPrice: unitPrice,
          TaxAmount: taxAmount,
        });
      });
    });
  } else {
    throw new NoOrdersFoundError();
  }

  return associations;
};
