export { auth, db } from "@/lib/firebase";
export {
  getProducts,
  getProductById,
  getProductsByCategory,
  getCategories,
  createCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrdersByUserId,
  placeOrder,
  updateOrderStatus,
  listenToProducts,
  listenToOrders,
  listenToCategories,
} from "@/lib/db";
