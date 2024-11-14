import { ProductPagedQueryResponse } from "@commercetools/platform-sdk";
import { ProductData } from "../types/index.types";

function mapProductData(products: ProductPagedQueryResponse): ProductData {
  return {
    products: products.results.map((product) => ({
      variants: [
        {
          sku: product.masterData.current.masterVariant.sku || '', // Default to an empty string if undefined
          attributes: product.masterData.current.masterVariant.attributes || [] // Default to an empty array if undefined
        },
        ...product.masterData.current.variants
          .filter((variant) => variant.sku && variant.attributes) // Filter out invalid variants
          .map((variant) => ({
            sku: variant.sku || '', // Default to an empty string if undefined
            attributes: variant.attributes || [] // Default to an empty array if undefined
          }))
      ]
    }))
  };
}

export { mapProductData };
