import { createApiRoot } from "../client/create.client"

export const getCategoryByKey = async(categoryKey: string) => {
    return await createApiRoot()
      .categories()
      .withKey({key: categoryKey})
      .get()
      .execute()
  }
  