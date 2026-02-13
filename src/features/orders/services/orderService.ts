import { CreateOrderRequest, OrderWithItems } from '../types';

export const orderService = {
  async create(userId: string, data: CreateOrderRequest): Promise<OrderWithItems> {
    // TODO: implement - create order from cart, generate order number
    throw new Error('Not implemented');
  },

  async getById(userId: string, orderId: string): Promise<OrderWithItems | null> {
    // TODO: implement - fetch order with items
    throw new Error('Not implemented');
  },

  async getAll(userId: string): Promise<OrderWithItems[]> {
    // TODO: implement - fetch all orders for user
    throw new Error('Not implemented');
  },
};
