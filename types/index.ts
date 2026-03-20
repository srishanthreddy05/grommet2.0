export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  tags?: string[];
  categoryId: string;
  imageUrl: string;
  stock: number;
  createdAt: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  order?: number;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
  productCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  products: OrderProduct[];
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: number;
}

export interface Review {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  text: string;
  productId?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  role?: "admin" | "user";
  createdAt: number;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  announcementBar: string[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
}
