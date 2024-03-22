import { Request, Response } from 'express';
import { post } from './event.controller';
import { getCategoryByKey } from '../api/categories';
import { getProductById } from '../api/products';
import { readConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';

// Mocking dependencies
jest.mock('../api/categories');
jest.mock('../api/products');
jest.mock('../utils/config.utils');
jest.mock('../errors/custom.error');

describe('post', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockProductId = 'mockProductId';
  const mockCategoryId = 'mockCategoryId';

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle missing request body', async () => {
    // Executing the post function
    await expect(post(mockRequest as Request, mockResponse as Response)).rejects.toThrowError(CustomError);

    // Expectations
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('Bad request: No Pub/Sub message was received');
  });

  it('should handle missing message', async () => {
    mockRequest.body = {};
    
    // Executing the post function
    await expect(post(mockRequest as Request, mockResponse as Response)).rejects.toThrowError(CustomError);

    // Expectations
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('Bad request: Wrong No Pub/Sub message format');
  });

  it('should handle missing product id', async () => {
    mockRequest.body = { message: { data: null } };
    
    // Executing the post function
    await expect(post(mockRequest as Request, mockResponse as Response)).rejects.toThrowError(CustomError);

    // Expectations
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('Bad request: No product id in the Pub/Sub message');
  });

  it('should handle successful execution', async () => {
    const mockPubSubMessage = Buffer.from(JSON.stringify({ resource: { typeId: 'product', id: mockProductId } })).toString('base64');
    mockRequest.body = { message: { data: mockPubSubMessage } };
    
    // Mocking the response from getCategoryByKey
    (getCategoryByKey as jest.Mock).mockResolvedValue({ body: { id: mockCategoryId } });

    // Mocking the response from getProductById
    (getProductById as jest.Mock).mockResolvedValue({ body: { createdAt: new Date(), categories: [] } });

    // Mocking the response from readConfiguration
    (readConfiguration as jest.Mock).mockReturnValue({ categoryKey: 'mockCategoryKey' });

    // Executing the post function
    await post(mockRequest as Request, mockResponse as Response);

    // Expectations
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
  });

  it('should handle error during execution', async () => {
    const mockError = new Error('Mocked error');
    const mockPubSubMessage = Buffer.from(JSON.stringify({ resource: { typeId: 'product', id: mockProductId } })).toString('base64');
    mockRequest.body = { message: { data: mockPubSubMessage } };
    
    // Mocking the response from getCategoryByKey
    (getCategoryByKey as jest.Mock).mockResolvedValue({ body: { id: mockCategoryId } });

    // Mocking the response from getProductById to throw an error
    (getProductById as jest.Mock).mockRejectedValue(mockError);

    // Mocking the response from readConfiguration
    (readConfiguration as jest.Mock).mockReturnValue({ categoryKey: 'mockCategoryKey' });

    // Executing the post function
    await expect(post(mockRequest as Request, mockResponse as Response)).rejects.toThrowError(CustomError);

    // Expectations
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('Bad request: Error: Mocked error');
  });
});
