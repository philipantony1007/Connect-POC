import { Order, OrderPagedQueryResponse, LineItem } from '@commercetools/platform-sdk';
import { mapOrderAssociations, mapOrderToCsv } from './order.service';
import { NoOrdersFoundError } from '../errors/extendedCustom.error';

describe('mapOrderAssociations', () => {
  it('should map SKUs from orders with line items', () => {
    const mockOrders: any = {
      results: [
        { lineItems: [{ variant: { sku: 'sku1' } }, { variant: { sku: 'sku2' } }] } as Order,
        { lineItems: [{ variant: { sku: 'sku3' } }] } as Order,
      ],
      count: 2,
    };

    const result = mapOrderAssociations(mockOrders);
    expect(result).toEqual([['sku1', 'sku2'], ['sku3']]);
  });

  it('should throw NoOrdersFoundError if no orders are present', () => {
    const emptyOrders: any = {
      results: [],
      count: 0,
    };

    expect(() => mapOrderAssociations(emptyOrders)).toThrow(NoOrdersFoundError);
  });
});

describe('mapOrderToCsv', () => {
  it('should map order details to CSV format with header', () => {
    const mockOrders: any = {
      results: [
        {
          id: 'order1',
          completedAt: '2024-11-10T00:00:00.000Z',
          customerEmail: 'customer@example.com',
          lineItems: [
            { variant: { sku: 'sku1' }, quantity: 2, price: { value: { centAmount: 500 } }, taxedPrice: { totalTax: { centAmount: 100 } } },
            { variant: { sku: 'sku2' }, quantity: 1, price: { value: { centAmount: 1000 } }, taxedPrice: { totalTax: { centAmount: 200 } } },
          ],
        } as Order,
      ],
      count: 1,
    };

    const result = mapOrderToCsv(mockOrders);
    expect(result).toEqual([
      ['SalesOrderNumber', 'SalesOrderLineNumber', 'OrderDate', 'EmailAddress', 'sku', 'Quantity', 'UnitPrice', 'TaxAmount'],
      ['order1', '1', '10-11-2024', 'customer@example.com', 'sku1', '2', '5.00', '1.0000'],
      ['order1', '2', '10-11-2024', 'customer@example.com', 'sku2', '1', '10.00', '2.0000'],
    ]);
  });

  it('should handle missing SKU, tax, and customer email fields gracefully', () => {
    const mockOrders: any = {
      results: [
        {
          id: 'order2',
          createdAt: '2024-11-11T00:00:00.000Z',
          lineItems: [
            { variant: { sku: undefined }, quantity: 1, price: { value: { centAmount: 2000 } }, taxedPrice: { totalTax: { centAmount: 0 } } },
          ],
        } as Order,
      ],
      count: 1,
    };

    const result = mapOrderToCsv(mockOrders);
    expect(result).toEqual([
      ['SalesOrderNumber', 'SalesOrderLineNumber', 'OrderDate', 'EmailAddress', 'sku', 'Quantity', 'UnitPrice', 'TaxAmount'],
      ['order2', '1', '11-11-2024', 'N/A', 'N/A', '1', '20.00', '0.0000'],
    ]);
  });

  it('should return only header row for empty order list', () => {
    const emptyOrders: any = {
      results: [],
      count: 0,
    };

    const result = mapOrderToCsv(emptyOrders);
    expect(result).toEqual([
      ['SalesOrderNumber', 'SalesOrderLineNumber', 'OrderDate', 'EmailAddress', 'sku', 'Quantity', 'UnitPrice', 'TaxAmount'],
    ]);
  });
});
