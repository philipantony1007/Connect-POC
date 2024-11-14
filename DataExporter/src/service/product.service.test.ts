import { ProductPagedQueryResponse } from "@commercetools/platform-sdk";
import { mapProductData } from "./product.service";
import { ProductData } from "../types/index.types";

describe('Product Mapping Service', () => {
  it('should correctly map product data with master variant only', () => {
    const mockProductResponse: any = {
      offset: 0,
      limit: 20,
      count: 1,
      total: 1,
      results: [{
        id: '1',
        version: 1,
        masterData: {
          current: {
            masterVariant: {
              id: 1,
              sku: 'MASTER-SKU-1',
              attributes: [
                { name: 'color', value: 'red' },
                { name: 'size', value: 'M' }
              ]
            },
            variants: [],
            name: { 'en': 'Test Product' },
            categories: [],
            slug: { 'en': 'test-product' }
          },
          staged: {
            masterVariant: {
              id: 1,
              sku: 'MASTER-SKU-1',
              attributes: []
            },
            variants: [],
            name: { 'en': 'Test Product' },
            categories: [],
            slug: { 'en': 'test-product' }
          },
          published: true,
          hasStagedChanges: false
        },
        createdAt: '',
        lastModifiedAt: ''
      }]
    };

    const expectedOutput: ProductData = {
      products: [{
        variants: [{
          sku: 'MASTER-SKU-1',
          attributes: [
            { name: 'color', value: 'red' },
            { name: 'size', value: 'M' }
          ]
        }]
      }]
    };

    const result = mapProductData(mockProductResponse);
    expect(result).toEqual(expectedOutput);
  });

  it('should correctly map product data with master variant and additional variants', () => {
    const mockProductResponse: any = {
      offset: 0,
      limit: 20,
      count: 1,
      total: 1,
      results: [{
        id: '1',
        version: 1,
        masterData: {
          current: {
            masterVariant: {
              id: 1,
              sku: 'MASTER-SKU-1',
              attributes: [
                { name: 'color', value: 'red' },
                { name: 'size', value: 'M' }
              ]
            },
            variants: [
              {
                id: 2,
                sku: 'VARIANT-SKU-1',
                attributes: [
                  { name: 'color', value: 'blue' },
                  { name: 'size', value: 'L' }
                ]
              },
              {
                id: 3,
                sku: 'VARIANT-SKU-2',
                attributes: [
                  { name: 'color', value: 'green' },
                  { name: 'size', value: 'S' }
                ]
              }
            ],
            name: { 'en': 'Test Product' },
            categories: [],
            slug: { 'en': 'test-product' }
          },
          staged: {
            masterVariant: {
              id: 1,
              sku: 'MASTER-SKU-1',
              attributes: []
            },
            variants: [],
            name: { 'en': 'Test Product' },
            categories: [],
            slug: { 'en': 'test-product' }
          },
          published: true,
          hasStagedChanges: false
        },
        createdAt: '',
        lastModifiedAt: ''
      }]
    };

    const expectedOutput: ProductData = {
      products: [{
        variants: [
          {
            sku: 'MASTER-SKU-1',
            attributes: [
              { name: 'color', value: 'red' },
              { name: 'size', value: 'M' }
            ]
          },
          {
            sku: 'VARIANT-SKU-1',
            attributes: [
              { name: 'color', value: 'blue' },
              { name: 'size', value: 'L' }
            ]
          },
          {
            sku: 'VARIANT-SKU-2',
            attributes: [
              { name: 'color', value: 'green' },
              { name: 'size', value: 'S' }
            ]
          }
        ]
      }]
    };

    const result = mapProductData(mockProductResponse);
    expect(result).toEqual(expectedOutput);
  });



  it('should handle empty product results', () => {
    const mockProductResponse: ProductPagedQueryResponse = {
      offset: 0,
      limit: 20,
      count: 0,
      total: 0,
      results: []
    };

    const expectedOutput: ProductData = {
      products: []
    };

    const result = mapProductData(mockProductResponse);
    expect(result).toEqual(expectedOutput);
  });
});