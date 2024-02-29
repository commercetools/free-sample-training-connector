import { UpdateAction } from '@commercetools/sdk-client-v2';

import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { Resource } from '../interfaces/resource.interface';
import { GraphQLResponse, LineItem} from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import {channelId} from '../connector/actions'

/**
 * Handle the update action
 *
 * @param {Resource} resource The resource from the request body
 * @returns {object}
 */
const update = async (resource: Resource) => {
  let productId = undefined;
  const freeSampleSku:string = readConfiguration().freeSampleSku;
  const freeSampleChannel:string = readConfiguration().freeSampleChannel
  try {
    const updateActions: Array<UpdateAction> = [];
    const freeLineItemKey: string = "free-sample-line-item"

    const cart = JSON.parse(JSON.stringify(resource));
    if (cart.obj.lineItems.length !== 0) {
      const cartCurrency = cart.obj.currency;

      var freeItemFound: boolean = cart.obj.lineItems.some(
        (lineItem: LineItem) => lineItem.key === freeLineItemKey);
      var cartEligible: boolean = cart.obj.centAmount >= 5000;
      
      if (cartEligible && !freeItemFound) {
        const query: string = 'query checkProductAvailabilityByChannelAndSku($channelId: String, $sku: String) {products(skus: [$sku]) {results {masterData {current {allVariants {availability {channels(includeChannelIds: [$channelId]) {results {availability {availableQuantity}}}}}}}}}}';
        const graphQLResponse: GraphQLResponse = await createApiRoot().graphql()
        .post({
          body:{
            query,
            variables: {
              channelId: channelId,
              sku: freeSampleSku
            }
          }})
        .execute().then(response => response.body);

        var availableQuantity: number = graphQLResponse.data.products.results[0].masterData.current.allVariants[0].availability.channels.results[0].availability.availableQuantity;

        const freeSampleAvailable: boolean = availableQuantity > 0;
        
        if (freeSampleAvailable) {
          const updateAction: UpdateAction = {
            action: 'addLineItem',
            sku: freeSampleSku,
            key: freeLineItemKey,
            supplyChannel: {typeId: "channel", key: freeSampleChannel},
            externalTotalPrice: {
              price: {
                currency: cartCurrency,
                centAmount: 0
              },
              totalPrice: {
                currency: cartCurrency,
                centAmount: 0
              }
            }
          };
          updateActions.push(updateAction);
        }
      }
      else if(!cartEligible && freeItemFound) {
        const updateAction: UpdateAction = {
          action: 'removeLineItem',
          lineItemKey: freeLineItemKey,
        };
        updateActions.push(updateAction);
      }
    }

    // Create the UpdateActions Object to return it to the client
    const updateAction: UpdateAction = {
      action: 'recalculate',
      updateProductData: false,
    };

    updateActions.push(updateAction);

    return { statusCode: 200, actions: updateActions };
  } catch (error) {
    // Retry or handle the error
    // Create an error object
    if (error instanceof Error) {
      throw new CustomError(
        400,
        `Internal server error on CartController: ${error.stack}`
      );
    }
  }
};



/**
 * Handle the cart controller according to the action
 *
 * @param {string} action The action that comes with the request. Could be `Create` or `Update`
 * @param {Resource} resource The resource from the request body
 * @returns {Promise<object>} The data from the method that handles the action
 */
export const cartController = async (action: string, resource: Resource) => {
  switch (action) {
    case 'Create': 
      break;
    case 'Update':{
      const data = update(resource);
      return data;
    }
    default:
      throw new CustomError(
        500,
        `Internal Server Error - Resource not recognized. Allowed values are 'Create' or 'Update'.`
      );
  }
};
