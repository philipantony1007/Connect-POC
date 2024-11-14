import { OrderPagedQueryResponse } from "@commercetools/platform-sdk";
import { mapCustomer } from "./customer.service";
import { CustomerData } from "../types/index.types";

describe('Customer Mapping Service', () => {
  it('should correctly map single order with single SKU', () => {
    const mockOrderResponse: any = {
      offset: 0,
      limit: 20,
      count: 1,
      total: 1,
      results: [{
        id: '1',
        version: 1,
        customerEmail: 'customer1@example.com',
        lineItems: [{
          variant: {
            sku: 'SKU-123'
          }
        }]
      }]
    };

    const expectedOutput: CustomerData = {
      customers: {
        'customer1@example.com': {
          Orders: ['SKU-123']
        }
      }
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should correctly map multiple orders from same customer', () => {
    const mockOrderResponse: any = {
      offset: 0,
      limit: 20,
      count: 2,
      total: 2,
      results: [
        {
          id: '1',
          version: 1,
          customerEmail: 'customer1@example.com',
          lineItems: [{
            variant: {
              sku: 'SKU-123'
            }
          }]
        },
        {
          id: '2',
          version: 1,
          customerEmail: 'customer1@example.com',
          lineItems: [{
            variant: {
              sku: 'SKU-456'
            }
          }]
        }
      ]
    };

    const expectedOutput: CustomerData = {
      customers: {
        'customer1@example.com': {
          Orders: ['SKU-123', 'SKU-456']
        }
      }
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should correctly map orders from different customers', () => {
    const mockOrderResponse: any = {
      offset: 0,
      limit: 20,
      count: 2,
      total: 2,
      results: [
        {
          id: '1',
          version: 1,
          customerEmail: 'customer1@example.com',
          lineItems: [{
            variant: {
              sku: 'SKU-123'
        }}]
        },
        {
          id: '2',
          version: 1,
          customerEmail: 'customer2@example.com',
          lineItems: [{
            variant: {
              sku: 'SKU-456'
            }
          }]
        }
      ]
    };

    const expectedOutput: CustomerData = {
      customers: {
        'customer1@example.com': {
          Orders: ['SKU-123']
        },
        'customer2@example.com': {
          Orders: ['SKU-456']
        }
      }
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle multiple SKUs in single order', () => {
    const mockOrderResponse: any = {
      offset: 0,
      limit: 20,
      count: 1,
      total: 1,
      results: [{
        id: '1',
        version: 1,
        customerEmail: 'customer1@example.com',
        lineItems: [
          {
            variant: {
              sku: 'SKU-123'
            }
          },
          {
            variant: {
              sku: 'SKU-456'
            }
          }
        ]
      }]
    };

    const expectedOutput: CustomerData = {
      customers: {
        'customer1@example.com': {
          Orders: ['SKU-123', 'SKU-456']
        }
      }
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle orders without customer email', () => {
    const mockOrderResponse: any = {
      offset: 0,
      limit: 20,
      count: 1,
      total: 1,
      results: [{
        id: '1',
        version: 1,
        lineItems: [{
          variant: {
            sku: 'SKU-123'
          }
        }]
      }]
    };

    const expectedOutput: CustomerData = {
      customers: {}
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle empty order results', () => {
    const mockOrderResponse: OrderPagedQueryResponse = {
      offset: 0,
      limit: 20,
      count: 0,
      total: 0,
      results: []
    };

    const expectedOutput: CustomerData = {
      customers: {}
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle orders with undefined SKUs', () => {
    const mockOrderResponse: any = {
      offset: 0,
      limit: 20,
      count: 1,
      total: 1,
      results: [{
        id: '1',
        version: 1,
        customerEmail: 'customer1@example.com',
        lineItems: [{
          variant: {}  // SKU is undefined
        }]
      }]
    };

    const expectedOutput: CustomerData = {
      customers: {
        'customer1@example.com': {
          Orders: []
        }
      }
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle mixed valid and undefined SKUs', () => {
    const mockOrderResponse: any = {
      offset: 0,
      limit: 20,
      count: 1,
      total: 1,
      results: [{
        id: '1',
        version: 1,
        customerEmail: 'customer1@example.com',
        lineItems: [
          {
            variant: {
              sku: 'SKU-123'
            }
          },
          {
            variant: {}  // SKU is undefined
          },
          {
            variant: {
              sku: 'SKU-456'
            }
          }
        ]
      }]
    };

    const expectedOutput: CustomerData = {
      customers: {
        'customer1@example.com': {
          Orders: ['SKU-123', 'SKU-456']
        }
      }
    };

    const result = mapCustomer(mockOrderResponse);
    expect(result).toEqual(expectedOutput);
  });
});