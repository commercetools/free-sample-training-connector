import { Request, Response } from 'express';

import { readConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { getProductsInCategory, removeCategoryFromProduct } from '../api/fetch.products';
import { getCategoryByKey } from '../api/categories';

/**
 * Exposed job endpoint.
 *
 * @param {Request} _request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (_request: Request, response: Response) => {
  try {
    // Get the Products
    logger.info(`Running job to remove Products from Category.`);

    const categoryKey:string =readConfiguration().categoryKey;
    const categoryId: string = await getCategoryByKey(categoryKey).then(({body}) => body.id);
                                  
    const today = new Date();
    const toDate = new Date(new Date().setDate(today.getDate() - 30));

    // Filter query used by Product Projection Search
    const filterQuery:string[] = [
      `categories.id:"${categoryId}"`,
      `createdAt:range (* to "${toDate.toISOString()}")`,
    ]

    const productsInCategory = await getProductsInCategory(filterQuery);

    for (const product of productsInCategory.results)
    {
      await removeCategoryFromProduct(product.id, product.version, categoryId);
    }

    logger.info(`Finished removing Products created before ${toDate.toDateString()} in category: ${categoryId}`);

    response.status(200).send();
  } catch (error) {
    throw new CustomError(
      500,
      `Internal Server Error - Error retrieving all orders from the commercetools SDK`
    );
  }
};