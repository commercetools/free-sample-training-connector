import CustomError from '../errors/custom.error';
import { readConfiguration } from './config.utils';
import * as validatorHelper from '../validators/helpers.validators';

// Mock .env
const mockEnv = {
  CTP_CLIENT_ID: 'mockClientId',
  CTP_CLIENT_SECRET: 'mockClientSecret',
  CTP_PROJECT_KEY: 'mockProjectKey',
  CTP_REGION: 'mockRegion',
  SAMPLE_PRODUCT_QUANTITY: '100',
  SAMPLE_PRODUCT_SKU: 'mockProductSku',
  CHANNEL_KEY: 'mockChannelKey',
  SAMPLE_LINEITEM_KEY: 'mockLineItemKey',
  CART_MIN_VALUE: '10',
};

describe('readConfiguration', () => {
  it('should return the correct configuration when env variables are valid', () => {
    process.env = mockEnv
    const expectedConfig = {
      clientId: 'mockClientId',
      clientSecret: 'mockClientSecret',
      projectKey: 'mockProjectKey',
      region: 'mockRegion',
      freeSampleQuantity: parseInt('100' || ''),
      freeSampleSku: 'mockProductSku',
      freeSampleChannelKey: 'mockChannelKey',
      freeLineItemKey: 'mockLineItemKey',
      minCartValue: parseInt('10' || ''),
    };

    // Mock the validation function to return an empty array
    jest.spyOn(validatorHelper, 'getValidateMessages').mockReturnValue([]);

    const config = readConfiguration();
    expect(config).toEqual(expectedConfig);
  });

  it('should throw a CustomError when env variables are invalid', () => {
    process.env = mockEnv;
    // Mock the validation function to return validation errors
    jest.spyOn(validatorHelper, 'getValidateMessages').mockReturnValue(['Invalid variable: CTP_CLIENT_ID']);

    expect(() => {readConfiguration();}).toThrow(CustomError);
  });
});