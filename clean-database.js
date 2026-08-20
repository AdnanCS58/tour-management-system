const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adnancse58_db_user:sJkttyoy2KnIIG4t@cluster0.63xzbrs.mongodb.net/tour-management?retryWrites=true&w=majority&appName=Cluster0';

async function cleanDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const collections = ['users', 'tours', 'expenses', 'documents', 'notifications', 'settlements', 'tests', 'connection_test'];
    
    for (const collectionName of collections) {
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`✅ ${collectionName}: Deleted ${result.deletedCount} documents`);
    }

    console.log('\n🎉 Database cleaned successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();