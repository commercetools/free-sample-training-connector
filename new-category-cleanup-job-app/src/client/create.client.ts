

import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ClientBuilder } from '@commercetools/sdk-client-v2';
import { createAuthMiddlewareOptions } from '../middleware/auth.middleware';
import { createHttpMiddlewareOptions } from '../middleware/http.middleware';

/**
 * Create client with apiRoot
 * apiRoot can now be used to build requests to de Composable Commerce API
 */

export const createClient = () =>
  new ClientBuilder()
    .withProjectKey(readConfiguration().projectKey)
    .withClientCredentialsFlow(createAuthMiddlewareOptions())
    .withHttpMiddleware(createHttpMiddlewareOptions(readConfiguration().region))
    .build();
    
export const createApiRoot = ((root?: ByProjectKeyRequestBuilder) => () => {
  if (root) {
    return root;
  }

  root = createApiBuilderFromCtpClient(createClient()).withProjectKey({
    projectKey: readConfiguration().projectKey,
  });

  return root;
})();

/**
 * Example code to get the Project details
 * This code has the same effect as sending a GET
 * request to the commercetools Composable Commerce API without any endpoints.
 *
 * @returns {Promise<ClientResponse<Project>>} apiRoot
 */
export const getProject = async () => {
  return await createApiRoot().get().execute();
};
