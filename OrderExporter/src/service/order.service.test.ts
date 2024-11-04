// event/src/service/order.service.test.ts

import { mapOrderAssociations } from './order.service';
import { NoOrdersFoundError } from '../errors/extendedCustom.error';
import { logger } from '../utils/logger.utils';

jest.mock('../utils/logger.utils', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('mapOrderAssociations', () => {
  const mockOrdersWithItems = {
    total: 2,
    results: [
      {
        lineItems: [
          { variant: { sku: 'SKU123' } },
          { variant: { sku: 'SKU456' } },
        ],
      },
      {
        lineItems: [
          { variant: { sku: 'SKU789' } },
        ],
      },
    ],
  };

  const mockOrdersEmpty = {
    total: 0,
    results: [],
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mock calls
  });

  it('should return a list of SKU associations when orders are found', () => {
    const result = mapOrderAssociations(mockOrdersWithItems);

    expect(result).toEqual([
      ['SKU123', 'SKU456'],
      ['SKU789'],
    ]);
    expect(logger.info).toHaveBeenCalledWith('Successfully processed 2 orders');
  });

  it('should throw NoOrdersFoundError when no orders are found', () => {
    expect(() => mapOrderAssociations(mockOrdersEmpty)).toThrow(NoOrdersFoundError);
    expect(logger.info).toHaveBeenCalledWith('No orders found');
  });
});
