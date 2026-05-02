require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../config/db');

const DEFAULT_PASSWORD = 'Passw0rd123!';

const ownerProfiles = [
  ['Sam', 'Carter'],
  ['Nina', 'Lopez'],
  ['Leo', 'Bennett'],
  ['Maya', 'Reed'],
  ['Owen', 'Brooks'],
  ['Ivy', 'Nguyen'],
  ['Noah', 'Patel'],
  ['Chloe', 'Rivera'],
  ['Ethan', 'Price'],
  ['Zoe', 'Foster']
];

const storeSeeds = [
  {
    ownerEmail: 'owner1@pickaroo.local',
    Store_Name: 'Sam Fresh Mart',
    Store_City: 'Los Angeles',
    Store_Loc: '102 Sunset Blvd, Los Angeles, CA',
    Store_ContactNum: '+1-555-4101',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Bananas (1kg)',   Prod_Price: 3.49,  Prod_Stock: 120, Prod_ImageURL: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Whole Milk (1L)', Prod_Price: 2.79,  Prod_Stock: 80,  Prod_ImageURL: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Eggs (12 pack)', Prod_Price: 4.99,  Prod_Stock: 60,  Prod_ImageURL: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Avocado (2 pack)',Prod_Price: 4.59,  Prod_Stock: 55,  Prod_ImageURL: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Greek Yogurt',   Prod_Price: 5.25,  Prod_Stock: 48,  Prod_ImageURL: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner2@pickaroo.local',
    Store_Name: 'Nina Daily Goods',
    Store_City: 'San Diego',
    Store_Loc: '88 Harbor Drive, San Diego, CA',
    Store_ContactNum: '+1-555-4201',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Jasmine Rice (5kg)',    Prod_Price: 14.50, Prod_Stock: 45,  Prod_ImageURL: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Olive Oil (750ml)',     Prod_Price: 11.99, Prod_Stock: 40,  Prod_ImageURL: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Pasta (500g)',          Prod_Price: 2.29,  Prod_Stock: 100, Prod_ImageURL: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Tomato Sauce Jar',     Prod_Price: 3.79,  Prod_Stock: 66,  Prod_ImageURL: 'https://images.unsplash.com/photo-1608032364895-84f0c6f1a512?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Black Pepper Grinder', Prod_Price: 6.49,  Prod_Stock: 30,  Prod_ImageURL: 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner3@pickaroo.local',
    Store_Name: 'Leo Corner Shop',
    Store_City: 'San Jose',
    Store_Loc: '455 Downtown St, San Jose, CA',
    Store_ContactNum: '+1-555-4301',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Orange Juice (1L)',        Prod_Price: 3.99,  Prod_Stock: 70, Prod_ImageURL: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Chicken Breast (1kg)',     Prod_Price: 9.49,  Prod_Stock: 35, Prod_ImageURL: 'https://images.unsplash.com/photo-1604503468506-a8da13d11bbc?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Brown Bread Loaf',        Prod_Price: 2.99,  Prod_Stock: 55, Prod_ImageURL: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Butter Croissants (4 pack)', Prod_Price: 5.79, Prod_Stock: 28, Prod_ImageURL: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Strawberry Jam',          Prod_Price: 4.19,  Prod_Stock: 44, Prod_ImageURL: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner4@pickaroo.local',
    Store_Name: 'Maya Market Kitchen',
    Store_City: 'Sacramento',
    Store_Loc: '24 Riverfront Ave, Sacramento, CA',
    Store_ContactNum: '+1-555-4401',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Sourdough Loaf',       Prod_Price: 4.49, Prod_Stock: 38, Prod_ImageURL: 'https://images.unsplash.com/photo-1585478259715-4d3a2660d0c9?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Turkey Slices',        Prod_Price: 6.89, Prod_Stock: 42, Prod_ImageURL: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Cheddar Cheese Block', Prod_Price: 5.99, Prod_Stock: 36, Prod_ImageURL: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Spinach Bag',          Prod_Price: 3.29, Prod_Stock: 54, Prod_ImageURL: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Cherry Tomatoes',      Prod_Price: 3.69, Prod_Stock: 50, Prod_ImageURL: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner5@pickaroo.local',
    Store_Name: 'Owen Pantry House',
    Store_City: 'Fresno',
    Store_Loc: '301 Market Lane, Fresno, CA',
    Store_ContactNum: '+1-555-4501',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Peanut Butter Jar', Prod_Price: 4.99, Prod_Stock: 43, Prod_ImageURL: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Granola Cereal',    Prod_Price: 5.49, Prod_Stock: 39, Prod_ImageURL: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Instant Oats',      Prod_Price: 3.79, Prod_Stock: 71, Prod_ImageURL: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Honey Bottle',      Prod_Price: 7.29, Prod_Stock: 27, Prod_ImageURL: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Trail Mix Pack',    Prod_Price: 6.19, Prod_Stock: 33, Prod_ImageURL: 'https://images.unsplash.com/photo-1604940672516-e1a41d2ec66c?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner6@pickaroo.local',
    Store_Name: 'Ivy Green Basket',
    Store_City: 'Oakland',
    Store_Loc: '17 Lakeshore Blvd, Oakland, CA',
    Store_ContactNum: '+1-555-4601',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Baby Carrots',       Prod_Price: 2.69, Prod_Stock: 64, Prod_ImageURL: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Broccoli Crowns',    Prod_Price: 3.19, Prod_Stock: 58, Prod_ImageURL: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Red Apples (1kg)',   Prod_Price: 4.39, Prod_Stock: 72, Prod_ImageURL: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Cucumber (2 pack)',  Prod_Price: 2.89, Prod_Stock: 46, Prod_ImageURL: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Bell Pepper Trio',  Prod_Price: 4.79, Prod_Stock: 41, Prod_ImageURL: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner7@pickaroo.local',
    Store_Name: 'Noah Urban Grocery',
    Store_City: 'Long Beach',
    Store_Loc: '910 Pine Ave, Long Beach, CA',
    Store_ContactNum: '+1-555-4701',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Sparkling Water (6 pack)', Prod_Price: 5.99, Prod_Stock: 49, Prod_ImageURL: 'https://images.unsplash.com/photo-1606168094336-48f8a46e5b6d?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Cold Brew Coffee',        Prod_Price: 4.59, Prod_Stock: 34, Prod_ImageURL: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Lemon Soda (4 pack)',     Prod_Price: 6.79, Prod_Stock: 29, Prod_ImageURL: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Iced Tea Bottle',         Prod_Price: 2.49, Prod_Stock: 63, Prod_ImageURL: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Energy Drink Can',        Prod_Price: 3.19, Prod_Stock: 57, Prod_ImageURL: 'https://images.unsplash.com/photo-1551269901-5c5e2149a8e4?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner8@pickaroo.local',
    Store_Name: 'Chloe Family Foods',
    Store_City: 'Anaheim',
    Store_Loc: '72 Center Street, Anaheim, CA',
    Store_ContactNum: '+1-555-4801',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Frozen Dumplings',   Prod_Price: 8.99,  Prod_Stock: 31, Prod_ImageURL: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Fish Fillets (500g)',Prod_Price: 10.49, Prod_Stock: 24, Prod_ImageURL: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Shrimp Pack',        Prod_Price: 12.79, Prod_Stock: 20, Prod_ImageURL: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Ground Beef (500g)', Prod_Price: 7.69,  Prod_Stock: 37, Prod_ImageURL: 'https://images.unsplash.com/photo-1588347818036-c4e2d60b5f5c?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Bacon Strips',       Prod_Price: 6.39,  Prod_Stock: 35, Prod_ImageURL: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner9@pickaroo.local',
    Store_Name: 'Ethan Quick Picks',
    Store_City: 'Irvine',
    Store_Loc: '540 Campus Drive, Irvine, CA',
    Store_ContactNum: '+1-555-4901',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Potato Chips Family Bag', Prod_Price: 4.89, Prod_Stock: 67, Prod_ImageURL: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Chocolate Cookies',      Prod_Price: 3.99, Prod_Stock: 52, Prod_ImageURL: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Protein Bar Box',        Prod_Price: 9.99, Prod_Stock: 26, Prod_ImageURL: 'https://images.unsplash.com/photo-1622484211684-4e5a9ca7a9d3?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Salted Pretzels',        Prod_Price: 3.49, Prod_Stock: 48, Prod_ImageURL: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Gummy Candy Pack',       Prod_Price: 2.99, Prod_Stock: 73, Prod_ImageURL: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&auto=format&fit=crop' }
    ]
  },
  {
    ownerEmail: 'owner10@pickaroo.local',
    Store_Name: 'Zoe Sunset Supplies',
    Store_City: 'Santa Barbara',
    Store_Loc: '19 Coastline Rd, Santa Barbara, CA',
    Store_ContactNum: '+1-555-5001',
    Store_Status: 'OPEN',
    products: [
      { Prod_Name: 'Toilet Paper (12 rolls)', Prod_Price: 11.49, Prod_Stock: 44, Prod_ImageURL: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Dish Soap',              Prod_Price: 3.59,  Prod_Stock: 51, Prod_ImageURL: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Laundry Detergent',      Prod_Price: 12.99, Prod_Stock: 23, Prod_ImageURL: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Paper Towels (6 pack)',  Prod_Price: 9.79,  Prod_Stock: 32, Prod_ImageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop' },
      { Prod_Name: 'Hand Soap Refill',       Prod_Price: 5.49,  Prod_Stock: 47, Prod_ImageURL: 'https://images.unsplash.com/photo-1617100134141-2bcd17771ab0?w=400&auto=format&fit=crop' }
    ]
  }
];

const seedUsers = [
  {
    User_FName: 'Cathy',
    User_LName: 'Customer',
    User_Email: 'customer@pickaroo.local',
    User_PhoneNum: '+1-555-1001',
    User_Address: '101 Customer Lane',
    User_Role: 'CUSTOMER'
  },
  ...ownerProfiles.map(([firstName, lastName], index) => ({
    User_FName: firstName,
    User_LName: lastName,
    User_Email: `owner${index + 1}@pickaroo.local`,
    User_PhoneNum: `+1-555-${String(2001 + index).padStart(4, '0')}`,
    User_Address: `${201 + index} Owner Street`,
    User_Role: 'STORE_OWNER'
  })),
  {
    User_FName: 'Ada',
    User_LName: 'Admin',
    User_Email: 'admin@pickaroo.local',
    User_PhoneNum: '+1-555-3001',
    User_Address: '301 Admin Avenue',
    User_Role: 'ADMIN'
  }
];

function createStoreQueryPlaceholders(count) {
  return Array.from({ length: count }, () => '?').join(', ');
}

async function upsertUsers(hashedPassword) {
  const sql = `
    INSERT INTO \`USER\`
      (\`User_FName\`, \`User_LName\`, \`User_Email\`, \`User_Password\`, \`User_PhoneNum\`, \`User_Address\`, \`User_Role\`)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      \`User_FName\` = VALUES(\`User_FName\`),
      \`User_LName\` = VALUES(\`User_LName\`),
      \`User_Password\` = VALUES(\`User_Password\`),
      \`User_PhoneNum\` = VALUES(\`User_PhoneNum\`),
      \`User_Address\` = VALUES(\`User_Address\`),
      \`User_Role\` = VALUES(\`User_Role\`);
  `;

  for (const user of seedUsers) {
    await pool.query(sql, [
      user.User_FName,
      user.User_LName,
      user.User_Email,
      hashedPassword,
      user.User_PhoneNum,
      user.User_Address,
      user.User_Role
    ]);
  }
}

async function upsertStores(ownerMap) {
  for (const store of storeSeeds) {
    const ownerId = ownerMap.get(store.ownerEmail);

    if (!ownerId) {
      throw new Error(`Owner not found for store "${store.Store_Name}" (${store.ownerEmail})`);
    }

    const [existingStoreRows] = await pool.query(
      'SELECT `Store_ID` FROM `STORE` WHERE `Store_Name` = ? AND `Store_OwnerID` = ? LIMIT 1',
      [store.Store_Name, ownerId]
    );

    if (existingStoreRows.length > 0) {
      await pool.query(
        `UPDATE \`STORE\`
         SET \`Store_City\` = ?, \`Store_Loc\` = ?, \`Store_ContactNum\` = ?, \`Store_Status\` = ?
         WHERE \`Store_ID\` = ?`,
        [
          store.Store_City,
          store.Store_Loc,
          store.Store_ContactNum,
          store.Store_Status,
          existingStoreRows[0].Store_ID
        ]
      );
      continue;
    }

    await pool.query(
      `INSERT INTO \`STORE\`
       (\`Store_Name\`, \`Store_City\`, \`Store_Loc\`, \`Store_ContactNum\`, \`Store_OwnerID\`, \`Store_Status\`)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        store.Store_Name,
        store.Store_City,
        store.Store_Loc,
        store.Store_ContactNum,
        ownerId,
        store.Store_Status
      ]
    );
  }
}

async function upsertProducts(storeMap) {
  for (const store of storeSeeds) {
    const storeId = storeMap.get(store.Store_Name);

    if (!storeId) {
      throw new Error(`Store not found while seeding products: ${store.Store_Name}`);
    }

    for (const product of store.products) {
      const [existingProductRows] = await pool.query(
        'SELECT `Prod_ID` FROM `PRODUCT` WHERE `Prod_StoreID` = ? AND `Prod_Name` = ? LIMIT 1',
        [storeId, product.Prod_Name]
      );

      if (existingProductRows.length > 0) {
        await pool.query(
          `UPDATE \`PRODUCT\`
           SET \`Prod_Price\` = ?, \`Prod_Stock\` = ?, \`Prod_ImageURL\` = ?
           WHERE \`Prod_ID\` = ?`,
          [product.Prod_Price, product.Prod_Stock, product.Prod_ImageURL, existingProductRows[0].Prod_ID]
        );
        continue;
      }

      await pool.query(
        `INSERT INTO \`PRODUCT\`
         (\`Prod_StoreID\`, \`Prod_Name\`, \`Prod_Price\`, \`Prod_Stock\`, \`Prod_ImageURL\`)
         VALUES (?, ?, ?, ?, ?)`,
        [storeId, product.Prod_Name, product.Prod_Price, product.Prod_Stock, product.Prod_ImageURL]
      );
    }
  }
}

async function seed() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  await upsertUsers(hashedPassword);

  const [owners] = await pool.query(
    "SELECT `User_ID`, `User_Email` FROM `USER` WHERE `User_Role` = 'STORE_OWNER'"
  );
  const ownerMap = new Map(owners.map((owner) => [owner.User_Email, owner.User_ID]));

  await upsertStores(ownerMap);

  const storeNames = storeSeeds.map((store) => store.Store_Name);
  const [stores] = await pool.query(
    `SELECT \`Store_ID\`, \`Store_Name\` FROM \`STORE\` WHERE \`Store_Name\` IN (${createStoreQueryPlaceholders(storeNames.length)})`,
    storeNames
  );
  const storeMap = new Map(stores.map((store) => [store.Store_Name, store.Store_ID]));

  await upsertProducts(storeMap);
}

seed()
  .then(async () => {
    const productCount = storeSeeds.reduce((count, store) => count + store.products.length, 0);
    console.log(`Seeded ${seedUsers.length} users, ${storeSeeds.length} stores, and ${productCount} products successfully.`);
    console.log(`Default password for seeded users: ${DEFAULT_PASSWORD}`);
    await pool.end();
  })
  .catch(async (error) => {
    console.error('User seeding failed:', error.message);
    await pool.end();
    process.exit(1);
  });