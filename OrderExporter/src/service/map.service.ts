import { OrderPagedQueryResponse, ProductPagedQueryResponse } from "@commercetools/platform-sdk";
import { mapCustomer } from "./customer.service";
import { mapProductData } from "./product.service";

function mapCombinedData(products: ProductPagedQueryResponse, orders: OrderPagedQueryResponse): any {
  // Get mapped customers data
  const customers = mapCustomer(orders);

  // Get mapped products data
  const productsData = mapProductData(products);

  // Combine products and customers data
  return {
    products: productsData.products,
    customers
  };
}

export { mapCombinedData };
