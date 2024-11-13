import { OrderPagedQueryResponse, ProductPagedQueryResponse } from "@commercetools/platform-sdk";
import { mapCustomer } from "./customer.service";
import { mapProductData } from "./product.service";

function mapCFTrainingData(products: ProductPagedQueryResponse, orders: OrderPagedQueryResponse): any {
  // Get mapped customers data
  const customersData = mapCustomer(orders);
  const productsData = mapProductData(products);

  // Combine products and customers data
  return {
    products: productsData.products,
    customers:customersData.customers
  };
}

export { mapCFTrainingData };
