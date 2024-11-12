import { LineItem, Order, OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { NoOrdersFoundError } from '../errors/extendedCustom.error';

export const mapOrderAssociations = (orders: OrderPagedQueryResponse): string[][] => {
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

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const mapOrderToCsv = (orders: OrderPagedQueryResponse): string[][] => { // Renamed for clarity
  const csvData: string[][] = [];

  // Header row for CSV
  csvData.push([
    'SalesOrderNumber',
    'SalesOrderLineNumber',
    'OrderDate',
    'EmailAddress',
    'sku',
    'Quantity',
    'UnitPrice',
    'TaxAmount'
  ]);

  orders.results?.forEach((order: Order) => {
    const orderDate = formatDate(order.completedAt || order.createdAt); 
    const email = order.customerEmail ?? 'N/A'; 
    const salesOrderNumber = order.id; 

    order.lineItems.forEach((item, index) => {
      const lineNumber = index + 1;
      const sku = item.variant?.sku ?? 'N/A'; 
      const quantity = item.quantity;
      const unitPrice = (item.price.value.centAmount / 100).toFixed(2);
      const taxAmount = ((item.taxedPrice?.totalTax?.centAmount ?? 0) / 100).toFixed(4); 

      csvData.push([
        salesOrderNumber,
        lineNumber.toString(),
        orderDate,
        email,
        sku,
        quantity.toString(),
        unitPrice,
        taxAmount
      ]);
    });
  });

  return csvData;
};
