# Pickaroo-Style Delivery Backend

Express.js + MySQL REST API using a clean MVC structure.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in your MySQL credentials.

3. Create database tables:

```bash
npm run db:init
```

4. Start the API:

```bash
npm run dev
```

## Main Endpoints

- `POST /api/auth/register` register a customer or store owner
- `POST /api/auth/login` get a JWT
- `GET /api/auth/me` get current user profile
- `GET /api/stores` list stores
- `POST /api/stores` create store as `STORE_OWNER` or `ADMIN`
- `GET /api/products?storeId=1&page=1&limit=10` list products with filtering and pagination
- `POST /api/products` create product as store owner/admin
- `POST /api/orders` create order as customer/admin with `items`
- `PATCH /api/orders/:id/assign-shopper` manually assign an active shopper
- `POST /api/deliveries` create delivery assignment as store owner/admin

Send JWTs as:

```http
Authorization: Bearer <token>
```

## Example Order Payload

```json
{
  "Order_StoreID": 1,
  "Order_DeliveryAddress": "123 Main Street",
  "items": [
    { "OItem_ProdID": 1, "OItem_Quantity": 2 },
    { "OItem_ProdID": 3, "OItem_Quantity": 1 }
  ]
}
```

Order creation checks stock, computes subtotals and total, inserts `ORDER` and `ORDER_ITEM` rows in a transaction, and decrements product stock.
