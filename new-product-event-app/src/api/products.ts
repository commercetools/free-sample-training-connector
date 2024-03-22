import { createApiRoot } from "../client/create.client"

export const getProductById = async(productId: string) => {
    return await createApiRoot()
      .productProjections()
      .withId({ ID: productId })
      .get()
      .execute();
};

export const addCategoryToProductById = async(productId: string, categoryId: string) => {
    return getProductById(productId).then(({body}) => {
        return createApiRoot()
            .products()
            .withId({ID: productId})
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
        });
};