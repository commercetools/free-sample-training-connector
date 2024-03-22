import { createApiRoot } from "../client/create.client";

export const isProductAvailable = async(freeSampleSku: string, channelId: string) : Promise<boolean> => {
    
    const query: string = `query {products(skus:["${freeSampleSku}"]) {results {masterData {current {variant(sku:"${freeSampleSku}") {availability {channels(includeChannelIds:["${channelId}"]) {results {availability {availableQuantity}}}}}}}}}}`;
    
    const graphQLResponse = await createApiRoot()
        .graphql()
        .post({
          body:{
            query
          }})
        .execute().then(response => response.body.data);
    
    return (0 < graphQLResponse.products.results[0].masterData.current.variant.availability.channels.results[0].availability.availableQuantity);
}