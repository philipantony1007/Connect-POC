import { OrderPagedQueryResponse } from "@commercetools/platform-sdk";
import { CustomerData } from "../types/index.types";

function mapCustomer(orders: OrderPagedQueryResponse): CustomerData {
  const customers: { [email: string]: { Orders: string[] } } = {};

  // Iterate through the orders
  orders.results.forEach((order) => {
    const customerEmail = order.customerEmail;
    
    // Skip orders without a customer email
    if (!customerEmail) return;

    // Get the list of SKUs for this order, filtering out undefined values
    const skus = order.lineItems
      .map((lineItem) => lineItem.variant.sku)
      .filter((sku): sku is string => sku !== undefined);

    // Add to the customers object
    if (!customers[customerEmail]) {
      customers[customerEmail] = { Orders: [] };
    }

    // Concatenate the SKUs to the customer's Orders list
    customers[customerEmail].Orders.push(...skus);
  });

  // Return the customers data under a `customers` property
  return { customers };
}

export { mapCustomer };
