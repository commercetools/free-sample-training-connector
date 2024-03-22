import { ProductPagedQueryResponse } from '@commercetools/platform-sdk';

import { createApiRoot } from '../client/create.client';
import { logger } from '../utils/logger.utils';


export const getProductsInCategory = async(filterQuery:string[]) =>{
  const {body} = await createApiRoot()
  .productProjections()
  .search()
  .get({
    queryArgs: {
      "filter.query": filterQuery,
      limit: 500,
    },
  })
  .execute();
  return body; 
}

export const removeCategoryFromProduct = async(
  productId: string,
  productVersion: number,
  categoryId: string
)=>{
  const {body} =  await createApiRoot()
    .products()
    .withId({ ID: productId })
    .post({
      body: {
        version: productVersion,
        actions: [
          {
            action: "removeFromCategory",
            category: {
              typeId: "category",
              id: categoryId,
            },
            staged:false
          },
        ],
      },
    })
    .execute();
    logger.info(`Removing: ${productId}`)
    return body; 
};