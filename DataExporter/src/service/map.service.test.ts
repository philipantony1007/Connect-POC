
import { mapCustomer } from './customer.service';
import { mapProductData } from './product.service';
import { CBFTrainingData } from '../types/index.types';
import { mapCBFTrainingData } from './map.service';

// Mock the dependencies
jest.mock('./customer.service');
jest.mock('./product.service');
const mockMapCustomer = mapCustomer as jest.MockedFunction<typeof mapCustomer>;
const mockMapProductData = mapProductData as jest.MockedFunction<typeof mapProductData>;

describe('mapCBFTrainingData', () => {
  it('should map product and customer data into CBFTrainingData format', () => {
    // Mock input data
    const mockProducts: any = {
      results: [
        {
          masterData: {
            current: {
              masterVariant: {
                sku: 'sku1',
                attributes: [
                  { name: 'color', value: 'red' },
                  { name: 'size', value: 'M' },
                ],
              },
              variants: [
                {
                  sku: 'sku2',
                  attributes: [
                    { name: 'color', value: 'blue' },
                    { name: 'size', value: 'L' },
                  ],
                },
              ],
            },
          },
        },
      ],
    };

    const mockOrders: any = {
      results: [
        {
          customerEmail: 'customer1@example.com',
          lineItems: [{ productId: 'sku1' }, { productId: 'sku2' }],
        },
      ],
    };

    // Mocked mapProductData and mapCustomer return values
    mockMapProductData.mockReturnValue({
      products: [
        {
          variants: [
            { sku: 'sku1', attributes: [{ name: 'color', value: 'red' }, { name: 'size', value: 'M' }] },
            { sku: 'sku2', attributes: [{ name: 'color', value: 'blue' }, { name: 'size', value: 'L' }] },
          ],
        },
      ],
    });

    mockMapCustomer.mockReturnValue({
      customers: {
        'customer1@example.com': { Orders: ['sku1', 'sku2'] },
      },
    });

    // Run the function
    const result: CBFTrainingData = mapCBFTrainingData(mockProducts, mockOrders);

    // Expected output
    const expected: CBFTrainingData = {
      products: [
        {
          variants: [
            { sku: 'sku1', attributes: [{ name: 'color', value: 'red' }, { name: 'size', value: 'M' }] },
            { sku: 'sku2', attributes: [{ name: 'color', value: 'blue' }, { name: 'size', value: 'L' }] },
          ],
        },
      ],
      customers: {
        'customer1@example.com': { Orders: ['sku1', 'sku2'] },
      },
    };

    expect(result).toEqual(expected);
    expect(mockMapProductData).toHaveBeenCalledWith(mockProducts);
    expect(mockMapCustomer).toHaveBeenCalledWith(mockOrders);
  });
});
