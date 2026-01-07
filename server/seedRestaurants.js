import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Restaurant from './models/Restaurant.js';
import MenuItem from './models/MenuItem.js';
import { mockRestaurants, mockMenuItems } from './utils/mockEatsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function seedRestaurants() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rideshare';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing restaurant data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing restaurant and menu data');

    // Remove _id from mock data and let MongoDB generate new IDs
    const restaurantsWithoutIds = mockRestaurants.map(rest => {
      const { _id, ...restData } = rest;
      return restData;
    });

    // Insert restaurants
    const restaurants = await Restaurant.insertMany(restaurantsWithoutIds);
    console.log(`✅ Created ${restaurants.length} restaurants`);

    // Create a mapping from mock IDs to real MongoDB IDs
    const idMapping = {};
    mockRestaurants.forEach((mockRest, index) => {
      idMapping[mockRest._id] = restaurants[index]._id;
    });

    // Update menu items with real restaurant IDs and remove _id
    const menuItemsWithRealIds = mockMenuItems.map(item => {
      const { _id, ...itemData } = item;
      return {
        ...itemData,
        restaurantId: idMapping[item.restaurantId],
      };
    });

    // Insert menu items
    const menuItems = await MenuItem.insertMany(menuItemsWithRealIds);
    console.log(`✅ Created ${menuItems.length} menu items`);

    // Display statistics
    const stats = {
      totalRestaurants: await Restaurant.countDocuments(),
      totalMenuItems: await MenuItem.countDocuments(),
      featuredRestaurants: await Restaurant.countDocuments({ featured: true }),
      activeRestaurants: await Restaurant.countDocuments({ status: 'active' }),
      cuisineTypes: await Restaurant.distinct('cuisine'),
    };

    console.log('\n=== 🎉 Restaurant Database Seeded Successfully! ===');
    console.log(JSON.stringify(stats, null, 2));
    console.log('\n📊 Sample Restaurants:');
    
    const sampleRestaurants = await Restaurant.find().limit(5).select('name cuisine rating');
    sampleRestaurants.forEach(rest => {
      console.log(`  - ${rest.name} (${rest.cuisine.join(', ')}) - Rating: ${rest.rating}⭐`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding restaurant database:', error);
    process.exit(1);
  }
}

seedRestaurants();

