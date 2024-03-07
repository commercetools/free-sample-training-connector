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

  // For our example we will use the customer id as a var
  // and the query the commercetools sdk with that info
  const decodedData = pubSubMessage
    ? Buffer.from(pubSubMessage, 'base64').toString().trim()
    : undefined;
  
  logger.info("Decoded: " + decodedData)
  if (decodedData) {
    const jsonData = JSON.parse(decodedData);

    if (jsonData.resource.typeId == "subscription"){
      response.status(204).send();
    }
    productId = jsonData.resource.id;
  }

  if (!productId) {
    throw new CustomError(
      400,
      'Bad request: No product id in the Pub/Sub message'
    );
  }

  try {
    let apiRoot = createApiRoot();
    const categoryKey:string = readConfiguration().categoryKey;
    
    const categoryId: string = await createApiRoot()
          .categories()
          .withKey({key: categoryKey})
          .get().execute().then(({body}) => body.id);

    await apiRoot
      .productProjections()
      .withId({ ID: productId })
      .get()
      .execute()
      .then(({body}) => {
        const createdAt = new Date(body.createdAt);
        const today = new Date();
        const fromDate = new Date(new Date().setDate(today.getDate() - 30));
        if((createdAt >= fromDate) && (body.categories?.find(category => category.id === categoryId) == undefined))
        {
          apiRoot.products()
            .withId({ID: body.id})
            .post({
              body: {
                version: body.version,
                actions: [{
                  action: "addToCategory",
                  category: {typeId: "category", id: categoryId}
                },
                {
                  action: "publish"    
                }]
              }
            })
            .execute();
        }
        else
        {
          logger.info("Product is already in the category");
        }
      })
  }
  catch (error) {
    throw new CustomError(400, `Bad request: ${error}`);
  }

  // Return the response for the client
  response.status(204).send();
};
