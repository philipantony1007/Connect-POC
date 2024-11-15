import { Order, OrderPagedQueryResponse } from '@commercetools/platform-sdk';
import { mapOrderForMBA, mapOrderForCS } from './order.service';
import { NoOrdersFoundError } from '../errors/extendedCustom.error';
import { CSOrderMapping, MBAOrderAssociations } from '../types/index.types';

describe('Order Mapping Service', () => {
  describe('mapOrderForMBA', () => {
    it('should correctly map orders to MBA associations', () => {
      const mockOrderResponse: OrderPagedQueryResponse = {
        offset: 0,
        limit: 20,
        count: 2,
        total: 2,
        results: [
          {
            id: 'order-1',
            version: 1,
            lineItems: [
              {
                id: 'line-1',
                productId: 'prod-1',
                variant: { id: 1, sku: 'SKU-1' },
                quantity: 1,
                price: { value: { centAmount: 1000, currencyCode: 'USD' } }
              },
              {
                id: 'line-2',
                productId: 'prod-2',
                variant: { id: 2, sku: 'SKU-2' },
                quantity: 2,
                price: { value: { centAmount: 2000, currencyCode: 'USD' } }
              }
            ]
          } as Order,
          {
            id: 'order-2',
            version: 1,
            lineItems: [
              {
                id: 'line-3',
                productId: 'prod-3',
                variant: { id: 3, sku: 'SKU-3' },
                quantity: 1,
                price: { value: { centAmount: 3000, currencyCode: 'USD' } }
              }
            ]
          } as Order
        ]
      };

      const expectedOutput: MBAOrderAssociations = [
        ['SKU-1', 'SKU-2'],
        ['SKU-3']
      ];

      const result = mapOrderForMBA(mockOrderResponse);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle orders with missing SKUs', () => {
      const mockOrderResponse: OrderPagedQueryResponse = {
        offset: 0,
        limit: 20,
        count: 1,
        total: 1,
        results: [
          {
            id: 'order-1',
            version: 1,
            lineItems: [
              {
                id: 'line-1',
                productId: 'prod-1',
                variant: { id: 1, sku: undefined },
                quantity: 1,
                price: { value: { centAmount: 1000, currencyCode: 'USD' } }
              },
              {
                id: 'line-2',
                productId: 'prod-2',
                variant: { id: 2, sku: 'SKU-2' },
                quantity: 2,
                price: { value: { centAmount: 2000, currencyCode: 'USD' } }
              }
            ]
          } as Order
        ]
      };

      const expectedOutput: MBAOrderAssociations = [
        ['SKU-2']
      ];

      const result = mapOrderForMBA(mockOrderResponse);
      expect(result).toEqual(expectedOutput);
    });

    it('should throw NoOrdersFoundError when no orders exist', () => {
      const mockOrderResponse: OrderPagedQueryResponse = {
        offset: 0,
        limit: 20,
        count: 0,
        total: 0,
        results: []
      };

      expect(() => mapOrderForMBA(mockOrderResponse)).toThrow(NoOrdersFoundError);
    });
  });

  describe('mapOrderForCS', () => {
    it('should correctly map orders to CS format', () => {
      const mockOrderResponse: OrderPagedQueryResponse = {
        offset: 0,
        limit: 20,
        count: 2,
        total: 2,
        results: [
          {
            id: 'order-1',
            orderNumber: 'ON-001',
            version: 1,
            lineItems: [
              {
                id: 'line-1',
                productId: 'prod-1',
                variant: { id: 1, sku: 'SKU-1' },
                quantity: 2,
                price: { value: { centAmount: 1000, currencyCode: 'USD' } },
                taxedPrice: { totalTax: { centAmount: 100 } }
              }
            ]
          } as Order,
          {
            id: 'order-2',
            orderNumber: 'ON-002',
            version: 1,
            lineItems: [
              {
                id: 'line-2',
                productId: 'prod-2',
                variant: { id: 2, sku: 'SKU-2' },
                quantity: 1,
                price: { value: { centAmount: 2000, currencyCode: 'USD' } },
                taxedPrice: { totalTax: { centAmount: 200 } }
              }
            ]
          } as Order
        ]
      };

      const expectedOutput: CSOrderMapping = {
        'ON-001': [
          {
            Quantity: '2',
            UnitPrice: '10.00',
            TaxAmount: '1.0000'
          }
        ],
        'ON-002': [
          {
            Quantity: '1',
            UnitPrice: '20.00',
            TaxAmount: '2.0000'
          }
        ]
      };

      const result = mapOrderForCS(mockOrderResponse);
      expect(result).toEqual(expectedOutput);
    });

    it('should use order ID when orderNumber is missing', () => {
      const mockOrderResponse: OrderPagedQueryResponse = {
        offset: 0,
        limit: 20,
        count: 1,
        total: 1,
        results: [
          {
            id: 'order-1',
            version: 1,
            lineItems: [
              {
                id: 'line-1',
                productId: 'prod-1',
                variant: { id: 1, sku: 'SKU-1' },
                quantity: 2,
                price: { value: { centAmount: 1000, currencyCode: 'USD' } },
                taxedPrice: { totalTax: { centAmount: 100 } }
              }
            ]
          } as Order
        ]
      };

      const expectedOutput: CSOrderMapping = {
        'order-1': [
          {
            Quantity: '2',
            UnitPrice: '10.00',
            TaxAmount: '1.0000'
          }
        ]
      };

      const result = mapOrderForCS(mockOrderResponse);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle missing tax amounts', () => {
      const mockOrderResponse: OrderPagedQueryResponse = {
        offset: 0,
        limit: 20,
        count: 1,
        total: 1,
        results: [
          {
            id: 'order-1',
            orderNumber: 'ON-001',
            version: 1,
            lineItems: [
              {
                id: 'line-1',
                productId: 'prod-1',
                variant: { id: 1, sku: 'SKU-1' },
                quantity: 2,
                price: { value: { centAmount: 1000, currencyCode: 'USD' } },
                taxedPrice: undefined
              }
            ]
          } as Order
        ]
      };

      const expectedOutput: CSOrderMapping = {
        'ON-001': [
          {
            Quantity: '2',
            UnitPrice: '10.00',
            TaxAmount: '0.0000'
          }
        ]
      };

      const result = mapOrderForCS(mockOrderResponse);
      expect(result).toEqual(expectedOutput);
    });

    it('should throw NoOrdersFoundError when no orders exist', () => {
      const mockOrderResponse: OrderPagedQueryResponse = {
        offset: 0,
        limit: 20,
        count: 0,
        total: 0,
        results: []
      };

      expect(() => mapOrderForCS(mockOrderResponse)).toThrow(NoOrdersFoundError);
    });
  });
});