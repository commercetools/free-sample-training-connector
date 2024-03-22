import CustomError from '../errors/custom.error';
import { Resource } from '../interfaces/resource.interface';
import { isProductAvailable } from '../api/products';
import { update, cartController } from './cart.controller';
import * as controller from './cart.controller';

// Mocking dependencies
jest.mock('../utils/config.utils', () => ({
  readConfiguration: jest.fn(() => ({
    freeSampleSku: 'mockSampleSku',
    minCartValue: 100,
    freeSampleChannelKey: 'mockChannelKey',
    freeLineItemKey: 'mockLineItemKey',
  })),
}));


jest.mock('../api/channels', () => ({
  getChannelByKey: jest.fn(() => {
    return new Promise((resolve) => {
      resolve({ id: 'mockChannelId' });
    });
  }),
}));

jest.mock('../api/products');

describe('update', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add line item and recalculate', async () => {
    const mockResource = {
      obj: {
        lineItems: [{ key: 'mockLineItemKey1' }],
        totalPrice: {
          currencyCode: 'USD',
          centAmount: 1000,
        },
      },
    };
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
    const mockResource = {
      obj: {
        lineItems: [{ key: 'mockLineItemKey' }],
        totalPrice: {
          currencyCode: 'USD',
          centAmount: 1,
        },
      },
    };
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
    const mockResource = {
      obj: {
        lineItems: [{ key: 'mockLineItemKey1' }],
        totalPrice: {
          currencyCode: 'USD',
          centAmount: 1001,
        },
      },
    };
    const mockError = new Error('Mocked error');

    // Mocking the error thrown by isProductAvailable
    (isProductAvailable as jest.Mock).mockRejectedValue(mockError);

    // Executing the update function

    await expect(update(mockResource)).rejects.toThrow();
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
    const updateMock = jest.spyOn(controller, 'update');
    await cartController('Update', mockResource);
    expect(controller.update).toHaveBeenCalled();
    updateMock.mockRestore();
  });

  it('should throw CustomError for unrecognized action', async () => {
    // Executing the cartController function with an invalid action

    try {
      await cartController('InvalidAction', mockResource);
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).statusCode).toBe(500);
      expect((error as CustomError).message).toContain(
        'Internal Server Error - Resource not recognized'
      );
    }
  });
});
