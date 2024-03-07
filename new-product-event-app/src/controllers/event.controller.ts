import { Request, Response } from 'express';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { readConfiguration } from '../utils/config.utils';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  let productId = undefined;

  // Check request body
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }

  // Check if the body comes in a message
  if (!request.body.message) {
    logger.error('Missing message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }

  // Receive the Pub/Sub message
  const pubSubMessage = request.body.message.data;
  logger.info("Raw data:",JSON.stringify(pubSubMessage));
  // For our example we will use the customer id as a var
  // and the query the commercetools sdk with that info
  const decodedData = pubSubMessage
    ? Buffer.from(pubSubMessage, 'base64').toString().trim()
    : undefined;
  logger.info("Decoded: " + decodedData)
  if (decodedData) {
    const jsonData = JSON.parse(decodedData);

    productId = jsonData.resource.id;

    logger.info("Product Resource ID:" + jsonData.resource.id);
  }

  if (!productId) {
    throw new CustomError(
      400,
      'Bad request: No product id in the Pub/Sub message'
    );
  }

  try {
    const envVars =  readConfiguration();
    let apiRoot = createApiRoot();
    const categoryKey:string = readConfiguration().categoryKey;
    
    const categoryId: string = await createApiRoot()
          .categories()
          .withKey({key: categoryKey})
          .get().execute().then(categoryResponse => categoryResponse.body.id);

    logger.info("Category ID: ", categoryId);
    const product = await apiRoot
      .productProjections()
      .withId({ ID: productId })
      .get()
      .execute();
    logger.info("Product Key: ", product.body.key);
    // Execute the tasks in need
    logger.info(product.body.categories?.find(category => category.id === categoryId)?.id);
  } catch (error) {
    throw new CustomError(400, `Bad request: ${error}`);
  }

  // Return the response for the client
  response.status(204).send();
};
