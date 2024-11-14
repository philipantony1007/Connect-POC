import { LineItem, Order, OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { NoOrdersFoundError } from '../errors/extendedCustom.error';
import { CSOrderMapping, MBAOrderAssociations } from '../types/index.types';


export const mapOrderForMBA = (orders: OrderPagedQueryResponse): MBAOrderAssociations => {
  const associations: MBAOrderAssociations = [];

  if (orders.results?.length > 0) {
    // Iterate over each order and extract line item SKUs
    orders.results.forEach((order: Order) => {
      const skuList = extractSkusFromLineItems(order.lineItems);
      if (skuList.length > 0) {
        associations.push(skuList);  // Push the extracted SKUs into the associations array
      }
    });
  } else {
    throw new NoOrdersFoundError();  // Throw error if no orders are found
  }

  return associations;
};

const extractSkusFromLineItems = (lineItems: LineItem[]): string[] => {
  if (!lineItems?.length) {
    return [];  // Return empty array if no line items exist
  }

  return lineItems
    .map((item) => item.variant?.sku)  // Extract SKU from variant
    .filter((sku): sku is string => sku !== undefined);  // Filter out undefined values
};




export const mapOrderForCS = (orders: OrderPagedQueryResponse): CSOrderMapping => {
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
