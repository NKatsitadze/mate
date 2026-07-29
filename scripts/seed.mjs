import { createHash } from 'crypto';
import { MongoClient, ObjectId } from 'mongodb';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const SEED_EMAIL_DOMAIN = '@mate.dev';
const SEED_PASSWORD_HASH = createHash('sha256').update('password123').digest('hex');
const s3Client = new S3Client({ region: process.env.AWS_REGION });

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function point(lat, lng) {
  return { type: 'Point', coordinates: [lng, lat] };
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');
}

async function uploadSeedImage(slug, sourceUrl) {
  const bucket = process.env.AWS_S3_BUCKET;
  const key = `listings/seed/${slug}.jpg`;

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`Image source returned ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'image/jpeg' })
    );

    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.warn(`Image upload skipped for "${slug}":`, error.message);
    return null;
  }
}

function unsplash(id) {
  return `https://images.unsplash.com/${id}?w=800&h=600&fit=crop&q=80`;
}

const SHOPS = [
  {
    ownerEmail: `grocery${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Nino Beridze',
    name: 'Fresh Corner Market',
    category: 'grocery_store',
    phone: '+995 555 10 10 10',
    address: '12 Chavchavadze Ave, Vake, Tbilisi',
    location: point(41.7085, 44.7565),
    listings: [
      {
        title: 'Fresh Bakery Bread Bundle',
        category: 'groceries_food',
        originalPrice: 15,
        discountPrice: 8,
        quantityAvailable: 10,
        durationDays: 165,
        imageUrl: unsplash('photo-1509440159596-0249088772ff'),
      },
      {
        title: 'Imported Cheese Selection Box',
        category: 'groceries_food',
        originalPrice: 45,
        discountPrice: 28,
        quantityAvailable: 5,
        durationDays: 180,
        imageUrl: unsplash('photo-1452195100486-9cc805987862'),
      },
      {
        title: 'Organic Vegetable Basket',
        category: 'groceries_food',
        originalPrice: 25,
        discountPrice: 15,
        quantityAvailable: 8,
        durationDays: 150,
        imageUrl: unsplash('photo-1540420773420-3366772f4999'),
      },
    ],
  },
  {
    ownerEmail: `bistro${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Sandro Javakhishvili',
    name: 'Rustaveli Bistro & Cafe',
    category: 'restaurant_cafe',
    phone: '+995 555 15 15 15',
    address: '34 Rustaveli Ave, Tbilisi',
    location: point(41.6977, 44.8014),
    listings: [
      {
        title: 'Classic Beef Burger Meal',
        category: 'groceries_food',
        originalPrice: 20,
        discountPrice: 12,
        quantityAvailable: 15,
        durationDays: 195,
        imageUrl: unsplash('photo-1568901346375-23c9450c58cd'),
      },
      {
        title: 'Margherita Pizza Slice Box',
        category: 'groceries_food',
        originalPrice: 18,
        discountPrice: 10,
        quantityAvailable: 12,
        durationDays: 170,
        imageUrl: unsplash('photo-1574071318508-1cdbab80d002'),
      },
      {
        title: 'Georgian Khinkali Platter',
        category: 'groceries_food',
        originalPrice: 22,
        discountPrice: 14,
        quantityAvailable: 10,
        durationDays: 185,
        imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Khinkali.jpg?width=800',
      },
    ],
  },
  {
    ownerEmail: `furniture${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Giorgi Abashidze',
    name: 'Tbilisi Home & Furniture',
    category: 'furniture_store',
    phone: '+995 555 20 20 20',
    address: '45 Pekini Ave, Saburtalo, Tbilisi',
    location: point(41.7286, 44.7488),
    listings: [
      {
        title: 'Scandinavian 3-Seat Sofa',
        category: 'furniture_home',
        originalPrice: 1200,
        discountPrice: 750,
        quantityAvailable: 1,
        durationDays: 200,
        imageUrl: unsplash('photo-1555041469-a586c61ea9bc'),
      },
      {
        title: 'Modern Dining Table Set',
        category: 'furniture_home',
        originalPrice: 950,
        discountPrice: 600,
        quantityAvailable: 2,
        durationDays: 160,
        imageUrl: unsplash('photo-1617806118233-18e1de247200'),
      },
    ],
  },
  {
    ownerEmail: `electronics${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Levan Kapanadze',
    name: 'TechHub Georgia',
    category: 'electronics_store',
    phone: '+995 555 30 30 30',
    address: '8 Vazha-Pshavela Ave, Vera, Tbilisi',
    location: point(41.7089, 44.7869),
    listings: [
      {
        title: 'Samsung 55" 4K Smart TV',
        category: 'electronics',
        originalPrice: 1800,
        discountPrice: 1300,
        quantityAvailable: 3,
        durationDays: 175,
        imageUrl: unsplash('photo-1593359677879-a4bb92f829d1'),
      },
      {
        title: 'Wireless Noise-Cancelling Headphones',
        category: 'electronics',
        originalPrice: 350,
        discountPrice: 220,
        quantityAvailable: 6,
        durationDays: 190,
        imageUrl: unsplash('photo-1505740420928-5e560c06d30e'),
      },
    ],
  },
  {
    ownerEmail: `fashion${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Mariam Lomidze',
    name: 'Vogue Vake Boutique',
    category: 'other',
    phone: '+995 555 40 40 40',
    address: '21 Ilia Chavchavadze Ave, Vake, Tbilisi',
    location: point(41.7108, 44.7601),
    listings: [
      {
        title: 'Designer Winter Coat Collection',
        category: 'fashion',
        originalPrice: 800,
        discountPrice: 480,
        quantityAvailable: 4,
        durationDays: 155,
        imageUrl: unsplash('photo-1539533018447-63fcce2678e3'),
      },
      {
        title: 'Leather Handbag Sale',
        category: 'fashion',
        originalPrice: 350,
        discountPrice: 210,
        quantityAvailable: 5,
        durationDays: 205,
        imageUrl: unsplash('photo-1584917865442-de89df76afd3'),
      },
    ],
  },
  {
    ownerEmail: `venue${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Davit Tsereteli',
    name: 'Mtatsminda Event Hall',
    category: 'event_venue',
    phone: '+995 555 50 50 50',
    address: '3 Sioni St, Old Town, Tbilisi',
    location: point(41.6886, 44.8095),
    listings: [
      {
        title: 'Weekend Venue Rental — Saturday Available',
        category: 'real_estate_rentals',
        originalPrice: 1500,
        discountPrice: 1000,
        quantityAvailable: 1,
        durationDays: 165,
        imageUrl: unsplash('photo-1519167758481-83f550bb49b3'),
      },
      {
        title: 'Rooftop Terrace — Evening Slot',
        category: 'real_estate_rentals',
        originalPrice: 600,
        discountPrice: 400,
        quantityAvailable: 1,
        durationDays: 180,
        imageUrl: unsplash('photo-1621275471769-e6aa344546d5'),
      },
    ],
  },
  {
    ownerEmail: `services${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Ana Chkheidze',
    name: 'QuickFix Home Services',
    category: 'service_provider',
    phone: '+995 555 60 60 60',
    address: '17 Kakheti Highway, Isani, Tbilisi',
    location: point(41.6912, 44.8321),
    listings: [
      {
        title: 'Home Deep Cleaning Package',
        category: 'services',
        originalPrice: 150,
        discountPrice: 90,
        quantityAvailable: 10,
        durationDays: 195,
        imageUrl: unsplash('photo-1581578731548-c64695cc6952'),
      },
      {
        title: 'AC Installation & Maintenance',
        category: 'services',
        originalPrice: 300,
        discountPrice: 180,
        quantityAvailable: 5,
        durationDays: 170,
        imageUrl: unsplash('photo-1621905251189-08b45d6a269e'),
      },
    ],
  },
  {
    ownerEmail: `flea${SEED_EMAIL_DOMAIN}`,
    ownerName: 'Zurab Natsvlishvili',
    name: 'Didube Flea Market Stand',
    category: 'other',
    phone: '+995 555 70 70 70',
    address: '2 Tbilisi Central Station Sq, Didube, Tbilisi',
    location: point(41.7462, 44.7719),
    listings: [
      {
        title: 'Assorted Vintage Collectibles Box',
        category: 'other',
        originalPrice: 200,
        discountPrice: 120,
        quantityAvailable: 3,
        durationDays: 160,
        imageUrl: unsplash('photo-1526170375885-4d8ecf77b99f'),
      },
      {
        title: 'Mystery Bargain Bundle',
        category: 'other',
        originalPrice: 100,
        discountPrice: 50,
        quantityAvailable: 6,
        durationDays: 185,
        imageUrl: unsplash('photo-1607082349566-187342175e2f'),
      },
    ],
  },
];

async function seed() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db();

  const users = db.collection('users');
  const shops = db.collection('shops');
  const listings = db.collection('listings');

  const seedEmails = SHOPS.map((shop) => shop.ownerEmail);
  const existingUsers = await users.find({ email: { $in: seedEmails } }).toArray();
  const existingUserIds = existingUsers.map((user) => user._id);
  const existingShops = await shops.find({ ownerId: { $in: existingUserIds } }).toArray();
  const existingShopIds = existingShops.map((shop) => shop._id);

  await listings.deleteMany({ shopId: { $in: existingShopIds } });
  await shops.deleteMany({ ownerId: { $in: existingUserIds } });
  await users.deleteMany({ email: { $in: seedEmails } });
  console.log(`Cleared ${existingUsers.length} previously-seeded shop(s) and their listings.`);

  let listingCount = 0;
  const now = new Date();

  for (const shop of SHOPS) {
    const userResult = await users.insertOne({
      name: shop.ownerName,
      email: shop.ownerEmail,
      passwordHash: SEED_PASSWORD_HASH,
      avatar: undefined,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    });

    const shopResult = await shops.insertOne({
      ownerId: userResult.insertedId,
      name: shop.name,
      category: shop.category,
      description: undefined,
      phone: shop.phone,
      address: shop.address,
      location: shop.location,
      photo: undefined,
      plan: 'free',
      status: 'active',
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    });

    const listingDocs = [];
    for (const listing of shop.listings) {
      const slug = slugify(`${shop.name}-${listing.title}`);
      const imageUrl = await uploadSeedImage(slug, listing.imageUrl);

      listingDocs.push({
        _id: new ObjectId(),
        shopId: shopResult.insertedId,
        shopOwnerId: userResult.insertedId,
        shopName: shop.name,
        location: shop.location,
        title: listing.title,
        description: undefined,
        category: listing.category,
        originalPrice: listing.originalPrice,
        discountPrice: listing.discountPrice,
        images: imageUrl ? [imageUrl] : [],
        quantityAvailable: listing.quantityAvailable,
        status: 'active',
        expiresAt: daysFromNow(listing.durationDays),
        createdAt: now,
        updatedAt: now,
      });
    }

    await listings.insertMany(listingDocs);
    listingCount += listingDocs.length;
    console.log(`Seeded "${shop.name}" (${shop.listings.length} listings).`);
  }

  console.log(`Done — ${SHOPS.length} shops, ${listingCount} listings.`);
  await client.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
