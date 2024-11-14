import {  ProductPagedQueryResponse } from '@commercetools/platform-sdk';

import { createApiRoot } from '../client/create.client';
import { getAll } from './request.modifier';
import { GetFunction } from '../types/index.types';

const getAllProducts: GetFunction<ProductPagedQueryResponse> = async (queryArgs) => {
  // Fetch all the orders
  const { body } = await createApiRoot().products().get({ queryArgs }).execute();

  return body;
};

export const fetchProducts: GetFunction<ProductPagedQueryResponse> = getAll(getAllProducts);
