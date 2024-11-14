import { OrderPagedQueryResponse, ProductPagedQueryResponse } from "@commercetools/platform-sdk";
import { mapCustomer } from "./customer.service";
import { mapProductData } from "./product.service";
import { CBFTrainingData } from "../types/index.types";

function mapCBFTrainingData(products: ProductPagedQueryResponse, orders: OrderPagedQueryResponse): CBFTrainingData {
  // Get mapped customers data
  const customersData = mapCustomer(orders);
  const productsData = mapProductData(products);

  // Combine products and customers data
  return {
    products: productsData.products,
    customers:customersData.customers
  };
}

export { mapCBFTrainingData };
