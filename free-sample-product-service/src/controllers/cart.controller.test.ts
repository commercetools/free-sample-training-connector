import CustomError from '../errors/custom.error';
import { Resource } from '../interfaces/resource.interface';
import { readConfiguration } from '../utils/config.utils';
import { isProductAvailable } from '../api/products';
import { update, cartController } from './cart.controller';

// Mocking dependencies
jest.mock('../utils/config.utils');
jest.mock('../api/products');
jest.mock('../errors/custom.error');

describe('update', () => {
  let mockResource: Resource;

  beforeEach(() => {
    mockResource = {
      obj: {
        lineItems: [],
        totalPrice: {
          currencyCode: 'USD',
          centAmount: 1000,
        },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add line item and recalculate', async () => {
    // Mocking the configuration read from utils
    (readConfiguration as jest.Mock).mockReturnValue({
      freeSampleSku: 'mockSampleSku',
      minCartValue: 100,
      freeSampleChannelKey: 'mockChannelKey',
      freeLineItemKey: 'mockLineItemKey',
    });

    // Mocking isProductAvailable to return true
    (isProductAvailable as jest.Mock).mockResolvedValue(true);

    // Executing the update function
    const result = await update(mockResource);

    // Expectations
    expect(result?.statusCode).toBe(200);
    expect(result?.actions).toHaveLength(2);
    expect(result?.actions[0].action).toBe('addLineItem');
    expect(result?.actions[1].action).toBe('recalculate');
  });

  it('should remove line item and recalculate', async () => {
    // Mocking the configuration read from utils
    (readConfiguration as jest.Mock).mockReturnValue({
      freeSampleSku: 'mockSampleSku',
      minCartValue: 100,
      freeSampleChannelKey: 'mockChannelKey',
      freeLineItemKey: 'mockLineItemKey',
    });

    // Mocking isProductAvailable to return false
    (isProductAvailable as jest.Mock).mockResolvedValue(false);

    // Executing the update function
    const result = await update(mockResource);

    // Expectations
    expect(result?.statusCode).toBe(200);
    expect(result?.actions).toHaveLength(2);
    expect(result?.actions[0].action).toBe('removeLineItem');
    expect(result?.actions[1].action).toBe('recalculate');
  });

  it('should throw CustomError on error', async () => {
    const mockError = new Error('Mocked error');

    // Mocking the error thrown by isProductAvailable
    (isProductAvailable as jest.Mock).mockRejectedValue(mockError);

    // Executing the update function
    await expect(update(mockResource)).rejects.toThrowError(CustomError);

    // Expectations
    expect(CustomError).toHaveBeenCalledWith(
      400,
      expect.stringContaining('Internal server error on CartController')
    );
  });
});

describe('cartController', () => {
  let mockResource: Resource;

  beforeEach(() => {
    mockResource = {
      obj: {
        lineItems: [],
        totalPrice: {
          currencyCode: 'USD',
          centAmount: 1000,
        },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle Update action', async () => {
    // Mocking the response from update function
    const mockUpdateData = { statusCode: 200, actions: [{ action: 'mockAction' }] };
    (update as jest.Mock).mockResolvedValue(mockUpdateData);

    // Executing the cartController function
    const result = await cartController('Update', mockResource);

    // Expectations
    expect(result).toEqual(mockUpdateData);
  });

  it('should throw CustomError for unrecognized action', async () => {
    // Executing the cartController function with an invalid action
    await expect(cartController('InvalidAction', mockResource)).rejects.toThrowError(CustomError);

    // Expectations
    expect(CustomError).toHaveBeenCalledWith(
      500,
      expect.stringContaining('Internal Server Error - Resource not recognized')
    );
  });
});
