import { OrderPagedQueryResponse } from "@commercetools/platform-sdk";

function mapCustomer(orders: OrderPagedQueryResponse): any {
  const customers: { [email: string]: { Orders: string[] } } = {};

  // Iterate through the orders
  orders.results.forEach((order) => {
    const customerEmail = order.customerEmail; // Assuming customer email is stored in `order.customerEmail`
    
    // Skip orders without a customer email
    if (!customerEmail) return;

    // Get the list of SKUs for this order, filtering out undefined values
    const skus = order.lineItems
      .map((lineItem) => lineItem.variant.sku)
      .filter((sku): sku is string => sku !== undefined); // Type guard to ensure all items are strings

    // Add to the customers object
    if (!customers[customerEmail]) {
      customers[customerEmail] = { Orders: [] };
    }

    // Concatenate the SKUs to the customer's Orders list
    customers[customerEmail].Orders.push(...skus);
  });

  // Log the grouped customers with their SKUs
  console.log("Customers grouped by email with SKUs:", customers);

  return customers;
}

export { mapCustomer };
