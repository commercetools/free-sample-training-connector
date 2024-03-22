import { createApiRoot } from "../client/create.client"

export const getChannelByKey = async(channelKey: string) => {
    return await createApiRoot()
      .channels()
      .get({queryArgs: {where: "key =\"" + channelKey + "\""}})
      .execute()
      .then(response => response.body.results[0])
  }
  