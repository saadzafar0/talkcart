import { searchProductsTool } from './searchProductsTool';
import { filterProductsTool } from './filterProductsTool';
import { addToCartTool } from './addToCartTool';
import { checkStockTool } from './checkStockTool';
import { hagglePriceTool } from './hagglePriceTool';
import { applyDiscountTool } from './applyDiscountTool';
import { getUserActivityTool } from './getUserActivityTool';
import { getRecommendationsTool } from './getRecommendationsTool';
import { goToCheckoutTool } from './goToCheckoutTool';
import { getCartTool } from './getCartTool';
import { goToCartTool } from './goToCartTool';

export const allTools = [
  searchProductsTool,
  filterProductsTool,
  addToCartTool,
  getCartTool,
  checkStockTool,
  hagglePriceTool,
  applyDiscountTool,
  getUserActivityTool,
  getRecommendationsTool,
  goToCheckoutTool,
  goToCartTool,
];

export {
  searchProductsTool,
  filterProductsTool,
  addToCartTool,
  getCartTool,
  checkStockTool,
  hagglePriceTool,
  applyDiscountTool,
  getUserActivityTool,
  getRecommendationsTool,
  goToCheckoutTool,
  goToCartTool,
};
