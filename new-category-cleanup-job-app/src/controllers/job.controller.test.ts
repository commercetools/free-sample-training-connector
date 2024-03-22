import { Request, Response } from 'express';
import { post } from './job.controller';
import { readConfiguration } from '../utils/config.utils';
import { logger } from '../utils/logger.utils';
import { getProductsInCategory, removeCategoryFromProduct } from '../api/fetch.products';
import { getCategoryByKey } from '../api/categories';

// Mocking dependencies
jest.mock('../utils/config.utils');
jest.mock('../utils/logger.utils');
jest.mock('../api/fetch.products');
jest.mock('../api/categories');

describe('Job Controller', () => {
    let req: Request;
    let res: Response;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully remove products from category', async () => {
    // Mocking configuration read from utils
    (readConfiguration as jest.Mock).mockReturnValue({ categoryKey: 'mockCategoryKey' });

    // Mocking the category ID retrieval
    const mockCategoryId = 'mockCategoryId';
    (getCategoryByKey as jest.Mock).mockResolvedValue({ body: { id: mockCategoryId } });

    // Mocking the response from getProductsInCategory
    const mockProducts = {
      results: [{ id: 'mockProductId1', version: 1 }, { id: 'mockProductId2', version: 1 }],
    };
    (getProductsInCategory as jest.Mock).mockResolvedValue(mockProducts);

    // Mocking the removeCategoryFromProduct function
    (removeCategoryFromProduct as jest.Mock).mockResolvedValue(undefined);

    // Executing the post function
    await post(req as Request, res as Response);

    // Expectations
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Running job to remove Products from Category.'));
    expect(readConfiguration).toHaveBeenCalled();
    expect(getCategoryByKey).toHaveBeenCalledWith('mockCategoryKey');
    expect(getProductsInCategory).toHaveBeenCalledWith(expect.arrayContaining([
      expect.stringContaining('categories.id'),
      expect.stringContaining('createdAt:range'),
    ]));
    expect(removeCategoryFromProduct).toHaveBeenCalledWith('mockProductId1', 1, mockCategoryId);
    expect(removeCategoryFromProduct).toHaveBeenCalledWith('mockProductId2', 1, mockCategoryId);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(`Finished removing Products created before`));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});
