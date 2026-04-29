#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

async function makeAdmin(username) {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB');

    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`✗ User "${username}" not found`);
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`ℹ User "${username}" is already an admin`);
      process.exit(0);
    }

    await User.updateOne({ _id: user._id }, { $set: { isAdmin: true } });
    console.log(`✓ Successfully made "${username}" an admin!`);
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

async function removeAdmin(username) {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB');

    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`✗ User "${username}" not found`);
      process.exit(1);
    }

    if (!user.isAdmin) {
      console.log(`ℹ User "${username}" is not an admin`);
      process.exit(0);
    }

    await User.updateOne({ _id: user._id }, { $set: { isAdmin: false } });
    console.log(`✓ Successfully revoked admin from "${username}"`);
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

async function listAdmins() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB');

    const admins = await User.find({ isAdmin: true }).select('username email createdAt');
    
    if (admins.length === 0) {
      console.log('ℹ No admin accounts found');
      process.exit(0);
    }

    console.log(`\n📋 Admin Accounts (${admins.length}):\n`);
    admins.forEach(admin => {
      console.log(`  • ${admin.username} (${admin.email}) - Created: ${admin.createdAt.toLocaleDateString()}`);
    });
    console.log();
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const command = args[0];
const username = args[1];

if (!command) {
  console.log(`
Usage: node scripts/make-admin.js <command> [username]

Commands:
  make <username>      Make a user an admin
  revoke <username>    Remove admin from a user
  list                 List all admin accounts

Examples:
  node scripts/make-admin.js make alice
  node scripts/make-admin.js revoke bob
  node scripts/make-admin.js list
  `);
  process.exit(0);
}

if (command === 'make') {
  if (!username) {
    console.error('✗ Username required');
    console.error('Usage: node scripts/make-admin.js make <username>');
    process.exit(1);
  }
  makeAdmin(username);
} else if (command === 'revoke') {
  if (!username) {
    console.error('✗ Username required');
    console.error('Usage: node scripts/make-admin.js revoke <username>');
    process.exit(1);
  }
  removeAdmin(username);
} else if (command === 'list') {
  listAdmins();
} else {
  console.error(`✗ Unknown command: ${command}`);
  console.error('Run "node scripts/make-admin.js" for help');
  process.exit(1);
}
