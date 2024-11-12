import { ProductPagedQueryResponse } from "@commercetools/platform-sdk";


function mapProductData(products: ProductPagedQueryResponse): any {

  return {
    products: products.results.map((product) => ({
      variants: [
        {
          sku: product.masterData.current.masterVariant.sku, // Master variant sku
          attributes: product.masterData.current.masterVariant.attributes // Master variant attributes
        },
        ...product.masterData.current.variants.map((variant) => ({
          sku: variant.sku, // Variant sku
          attributes: variant.attributes // Variant attributes
        }))
      ]
    })), 
  };
}

export { mapProductData };
