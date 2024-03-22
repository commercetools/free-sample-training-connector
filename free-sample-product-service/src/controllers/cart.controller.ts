import { UpdateAction } from '@commercetools/sdk-client-v2';

import CustomError from '../errors/custom.error';
import { Resource } from '../interfaces/resource.interface';
import { LineItem} from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import { isProductAvailable } from '../api/products';
import { getChannelByKey } from '../api/channels';

/**
 * Handle the update action
 *
 * @param {Resource} resource The resource from the request body
 * @returns {object}
 */
export const update = async (resource: Resource) => {
  const { freeSampleSku, minCartValue, freeSampleChannelKey, freeLineItemKey} = readConfiguration();

  try {
    const updateActions: Array<UpdateAction> = [];

    const cart = JSON.parse(JSON.stringify(resource));
    if (cart.obj.lineItems.length !== 0) {
      const cartCurrency = cart.obj.totalPrice.currencyCode;

      var freeItemFound: boolean = cart.obj.lineItems.some(
        (lineItem: LineItem) => lineItem.key === freeLineItemKey);
      var cartEligible: boolean = cart.obj.totalPrice.centAmount >= (minCartValue);
      
      if (cartEligible && !freeItemFound) {
        var channelId = await getChannelByKey(freeSampleChannelKey).then(response => response.id);
        
        const freeSampleAvailable: boolean = await isProductAvailable(freeSampleSku, channelId);
        
        if (freeSampleAvailable) {
          const updateActionAdd: UpdateAction = {
            action: 'addLineItem',
            sku: freeSampleSku,
            key: freeLineItemKey,
            supplyChannel: {typeId: "channel", key: freeSampleChannelKey},
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
