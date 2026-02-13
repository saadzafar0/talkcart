import { AddToCartRequest, CartSummary } from '../types';

export const cartService = {
  async getCart(userId: string): Promise<CartSummary> {
    // TODO: implement - fetch cart with items joined to products
    throw new Error('Not implemented');
  },

  async addItem(userId: string, data: AddToCartRequest): Promise<CartSummary> {
    // TODO: implement - add item to cart, create cart if needed
    throw new Error('Not implemented');
  },

  async removeItem(userId: string, itemId: string): Promise<CartSummary> {
    // TODO: implement - remove item from cart
    throw new Error('Not implemented');
  },

  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<CartSummary> {
    // TODO: implement - update item quantity
    throw new Error('Not implemented');
  },

  async clearCart(userId: string): Promise<void> {
    // TODO: implement - remove all items from cart
    throw new Error('Not implemented');
  },
};
