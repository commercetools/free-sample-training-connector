import CustomError from '../errors/custom.error';
import { Config } from '../interfaces/config.interface';
import envValidators from '../validators/env.validators';
import { getValidateMessages } from '../validators/helpers.validators';

/**
 * Read the configuration env vars
 * (Add yours accordingly)
 *
 * @returns The configuration with the correct env vars
 */
export const readConfiguration = () => {
  const envVars: Config = {
    clientId: process.env.CTP_CLIENT_ID as string,
    clientSecret: process.env.CTP_CLIENT_SECRET as string,
    projectKey: process.env.CTP_PROJECT_KEY as string,
    region: process.env.CTP_REGION as string,
    freeSampleQuantity: parseInt(process.env.SAMPLE_PRODUCT_QUANTITY || ''),
    freeSampleSku:process.env.SAMPLE_PRODUCT_SKU as string,
    freeSampleChannelKey:process.env.CHANNEL_KEY as string,
    freeLineItemKey:process.env.SAMPLE_LINEITEM_KEY as string,
    minCartValue: parseInt(process.env.CART_MIN_VALUE || ''),
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
      validationErrors
    );
  }

  return envVars;
};
