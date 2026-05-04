export type AppRole = 'customer' | 'store_owner' | 'admin';

export function mapRole(role?: string): AppRole {
  const normalized = String(role || '').toLowerCase();

  if (normalized === 'store_owner') return 'store_owner';
  if (normalized === 'admin') return 'admin';
  return 'customer';
}

export function mapUser(user: any) {
  if (!user) return null;

  return {
    id: user.User_ID ?? user.id,
    firstName: user.User_FName ?? user.firstName ?? '',
    lastName: user.User_LName ?? user.lastName ?? '',
    email: user.User_Email ?? user.email,
    phoneNumber: user.User_PhoneNum ?? user.phoneNumber ?? '',
    address: user.User_Address ?? user.address ?? '',
    role: mapRole(user.User_Role ?? user.role)
  };
}

export function mapStore(store: any) {
  if (!store) return null;

  return {
    id: store.Store_ID ?? store.id,
    name: store.Store_Name ?? store.name,
    city: store.Store_City ?? store.city,
    location: store.Store_Loc ?? store.location,
    contactNumber: store.Store_ContactNum ?? store.contactNumber,
    ownerId: store.Store_OwnerID ?? store.ownerId,
    status: store.Store_Status ?? store.status,
    category: store.category ?? 'Grocery',
    rating: store.rating ?? 4.8,
    image:
      store.image ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'
  };
}

export function mapProduct(product: any) {
  if (!product) return null;

  return {
    id: product.Prod_ID ?? product.id,
    storeId: product.Prod_StoreID ?? product.storeId,
    name: product.Prod_Name ?? product.name,
    price: Number(product.Prod_Price ?? product.price ?? 0),
    stock: Number(product.Prod_Stock ?? product.stock ?? 0),
    image:
      product.Prod_ImageURL ||
      product.image ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  };
}

export function mapOrder(order: any) {
  if (!order) return null;

  return {
    id: order.Order_ID ?? order.id,
    userId: order.Order_UserID ?? order.userId,
    storeId: order.Order_StoreID ?? order.storeId,
    shopperId: order.Order_ShoprID ?? order.shopperId,
    createdAt: order.Order_OrderDate ?? order.createdAt,
    total: Number(order.Order_Total ?? order.total ?? 0),
    status: String(order.Order_Status ?? order.status ?? 'pending').toLowerCase(),
    paymentStatus: String(order.Order_PaymentStatus ?? order.paymentStatus ?? 'pending').toLowerCase(),
    deliveryAddress: order.Order_DeliveryAddress ?? order.deliveryAddress,
    items: Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          id: item.OItem_ID ?? item.id,
          productId: item.OItem_ProdID ?? item.productId,
          quantity: item.OItem_Quantity ?? item.quantity,
          subtotal: Number(item.OItem_SubTotal ?? item.subtotal ?? 0),
          name: item.Prod_Name ?? item.name,
          image:
            item.Prod_ImageURL ||
            item.image ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
        }))
      : []
  };
}
