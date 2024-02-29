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
    scope: process.env.CTP_SCOPE as string,
    region: process.env.CTP_REGION as string,
    freeSampleChannel: process.env.CTP_CHANNEL as string,
    freeSampleQuantity: parseInt(process.env.CTP_QUANTITY || ''),
    freeSampleSku:process.env.CTP_SKU as string
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
