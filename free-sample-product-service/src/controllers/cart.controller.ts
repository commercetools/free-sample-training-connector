import { UpdateAction } from '@commercetools/sdk-client-v2';

import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { Resource } from '../interfaces/resource.interface';
import { LineItem} from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import { log } from 'console';

/**
 * Handle the update action
 *
 * @param {Resource} resource The resource from the request body
 * @returns {object}
 */
const update = async (resource: Resource) => {
  let apiRoot = createApiRoot();
  const freeSampleSku:string = readConfiguration().freeSampleSku;
  const minCartValue: number = readConfiguration().minCartValue;
  const freeSampleChannel:string = readConfiguration().freeSampleChannelKey;
  try {
    const updateActions: Array<UpdateAction> = [];
    const freeLineItemKey: string = readConfiguration().freeLineItemKey;

    const cart = JSON.parse(JSON.stringify(resource));
    if (cart.obj.lineItems.length !== 0) {
      const cartCurrency = cart.obj.totalPrice.currencyCode;
      log("Currency", cartCurrency);

      var freeItemFound: boolean = cart.obj.lineItems.some(
        (lineItem: LineItem) => lineItem.key === freeLineItemKey);
      var cartEligible: boolean = cart.obj.totalPrice.centAmount >= (minCartValue);
      
      if (cartEligible && !freeItemFound) {
        var channelQuery: string = 'query ($channelKey: String) { channel (key: $channelKey) {id}}';
        var channelId = await apiRoot
          .graphql()
          .post({
            body:{
              query: channelQuery,
              variables: {
                channelKey: freeSampleChannel
              }
            }})
          .execute().then(response => response.body.data.channel.id);
        
        const query: string = `query {products(skus:["${freeSampleSku}"]) {results {masterData {current {variant(sku:"${freeSampleSku}") {availability {channels(includeChannelIds:["${channelId}"]) {results {availability {availableQuantity}}}}}}}}}}`;
        const graphQLResponse = await apiRoot
        .graphql()
        .post({
          body:{
            query
          }})
        .execute().then(response => response.body.data);
            
        var availableQuantity: number = graphQLResponse.products.results[0].masterData.current.variant.availability.channels.results[0].availability.availableQuantity;
        
        const freeSampleAvailable: boolean = availableQuantity > 0;
        
        if (freeSampleAvailable) {
          const updateActionAdd: UpdateAction = {
            action: 'addLineItem',
            sku: freeSampleSku,
            key: freeLineItemKey,
            supplyChannel: {typeId: "channel", key: freeSampleChannel},
            inventoryMode: "ReserveOnOrder",
            externalTotalPrice: {
              price: {
                currencyCode: cartCurrency,
                centAmount: 0
              },
              totalPrice: {
                currencyCode: cartCurrency,
                centAmount: 0
              }
            }
          };
          updateActions.push(updateActionAdd);
        }
      }
      else if(!cartEligible && freeItemFound) {
        const updateActionRemove: UpdateAction = {
          action: 'removeLineItem',
          lineItemKey: freeLineItemKey,
        };
        updateActions.push(updateActionRemove);
      }
    }

    // Create the UpdateActions Object to return it to the client
    const updateAction: UpdateAction = {
      action: 'recalculate',
      updateProductData: false,
    };

    updateActions.push(updateAction);
    log("UpdateActions: ", updateActions[0],updateActions[1]);

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
