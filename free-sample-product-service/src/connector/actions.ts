import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { readConfiguration } from '../utils/config.utils';
import { Channel } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';


const CART_UPDATE_EXTENSION_KEY = 'free-sample-cartUpdateExtension';

  

export async function createChannelAndInventory(): Promise<void> {

  const freeSampleChannelKey:string = readConfiguration().freeSampleChannelKey;
  const freeSampleSku:string = readConfiguration().freeSampleSku;
  const freeSampleQuantity: number = readConfiguration().freeSampleQuantity;
  const freeSampleInventoryKey = "free-sample-" + freeSampleSku;
  let channel: Channel;
  
  const apiRoot = createApiRoot();

  const {
    body: { results: channels },
  } = await apiRoot
    .channels()
    .get({
      queryArgs: {
        where: `key = "${freeSampleChannelKey}"`,
      },
    })
    .execute();

  if (channels.length > 0) {
    channel = channels[0];
  } else {
    channel = await apiRoot
      .channels()
      .post({
        body: {
          key: freeSampleChannelKey,
          name: {
            en: 'Free Sample Supply Control Channel',
          },
          roles: ["InventorySupply"]
        },
      })
      .execute().then(channel => channel.body);
      console.log("Channel Created:", channel.id);
  }
  
  const {
    body: { results: inventories },
  } = await apiRoot
    .inventory()
    .get({
      queryArgs: {
        where: `key = "${freeSampleInventoryKey}"`,
      }
    })
    .execute();

  if (inventories.length > 0) {
    let inventory = inventories[0];
    await apiRoot
    .inventory()
    .withId({ID: inventory.id})
    .post(
      {body: {
        version: inventory.version,
        actions: [{
          action: "addQuantity",
          quantity: freeSampleQuantity
        }]
      }}
    )
    .execute();
  } else {
      await apiRoot
        .inventory()
        .post(
          {
            body: {
              sku: freeSampleSku,
              quantityOnStock: freeSampleQuantity,
              supplyChannel: {typeId: "channel", id: channel.id},
              key: freeSampleInventoryKey
            }
          }
        )
        .execute();
  }
}

export async function createCartUpdateExtension(
  applicationUrl: string
): Promise<void> {
  
  const apiRoot = createApiRoot();

  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${CART_UPDATE_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: CART_UPDATE_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }

  await apiRoot
    .extensions()
    .post({
      body: {
        key: CART_UPDATE_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: applicationUrl,
        },
        triggers: [
          {
            resourceTypeId: 'cart',
            actions: ['Update'],
          },
        ],
      },
    })
    .execute();
}

export async function deleteChannelAndInventory(): Promise<void> {

  const freeSampleChannelKey:string = readConfiguration().freeSampleChannelKey;
  const freeSampleSku:string = readConfiguration().freeSampleSku;
  const freeSampleInventoryKey = "free-sample-" + freeSampleSku;
  let channel: Channel;
  
  const apiRoot = createApiRoot();

  const {
    body: { results: channels },
  } = await apiRoot
    .channels()
    .get({
      queryArgs: {
        where: `key = "${freeSampleChannelKey}"`,
      },
    })
    .execute();

  if (channels.length > 0) {
    channel = channels[0];
  
    const {
      body: { results: inventories },
    } = await apiRoot
      .inventory()
      .get({
        queryArgs: {
          where: `key = "${freeSampleInventoryKey}"`,
        }
      })
      .execute();

    if (inventories.length > 0) {
      let inventory = inventories[0];
      await apiRoot
      .inventory()
      .withId({ID: inventory.id})
      .delete(
        {queryArgs: {
          version: inventory.version,
        }}
      )
      .execute();
    }
    await apiRoot
      .channels()
      .withId({ID: channel.id})
      .delete(
        {queryArgs: {
          version: channel.version,
        }}
      )
      .execute();
  }
}

export async function deleteCartUpdateExtension(): Promise<void> {
  
  const apiRoot = createApiRoot();

  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${CART_UPDATE_EXTENSION_KEY}"`,
      },
    })
    .execute();

  if (extensions.length > 0) {
    const extension = extensions[0];

    await apiRoot
      .extensions()
      .withKey({ key: CART_UPDATE_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }
}