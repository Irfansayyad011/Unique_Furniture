require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAccounts = async () => {
  await connectDB();

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;

  const ownerUsername = process.env.OWNER_USERNAME || 'owner';
  const ownerPassword = process.env.OWNER_PASSWORD;

  if (!adminPassword || !ownerPassword) {
    console.error('❌ Error: ADMIN_PASSWORD and OWNER_PASSWORD must be configured in your .env file.');
    process.exit(1);
  }

  // 1. Admin
  let admin = await User.findOne({ username: adminUsername }).select('+password');
  if (!admin) {
    admin = await User.create({
      username: adminUsername, 
      password: adminPassword,
      role: 'admin',
      active: true,
    });
    console.log('✅ Admin account created successfully:');
  } else {
    admin.password = adminPassword;
    admin.role = 'admin';
    admin.active = true;
    await admin.save();
    console.log('✅ Admin account updated/verified:');
  }
  console.log(`   Username: ${adminUsername}`);

  // 2. Single Owner
  let owner = await User.findOne({ username: ownerUsername }).select('+password');
  if (!owner) {
    owner = await User.create({
      username: ownerUsername,
      password: ownerPassword,
      role: 'owner',
      active: true,
    });
    console.log('✅ Single Owner account created successfully:');
  } else {
    owner.password = ownerPassword;
    owner.role = 'owner';
    owner.active = true;
    await owner.save();
    console.log('✅ Single Owner account updated/verified:');
  }
  console.log(`   Username: ${ownerUsername}`);

  process.exit(0);
};

seedAccounts().catch((err) => {
  console.error('Error seeding accounts:', err);
  process.exit(1);
});
