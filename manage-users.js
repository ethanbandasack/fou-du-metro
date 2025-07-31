#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, 'src/data/users.json');

// Ensure users.json exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}

function generateHash() {
  return crypto.randomBytes(8).toString('hex');
}

function addUser(username) {
  const users = loadUsers();
  
  // Check if username already exists
  if (users.find(user => user.username === username)) {
    console.error(`❌ User "${username}" already exists!`);
    return false;
  }
  
  const hash = generateHash();
  const newUser = {
    id: Date.now().toString(),
    username,
    hash,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  if (saveUsers(users)) {
    console.log(`✅ User created successfully!`);
    console.log(`Username: ${username}`);
    console.log(`Auth Code: ${hash}`);
    console.log(`\n🔑 Share this auth code with the user for login.`);
    return true;
  }
  
  return false;
}

function removeUser(username) {
  const users = loadUsers();
  const initialLength = users.length;
  const filteredUsers = users.filter(user => user.username !== username);
  
  if (filteredUsers.length === initialLength) {
    console.error(`❌ User "${username}" not found!`);
    return false;
  }
  
  if (saveUsers(filteredUsers)) {
    console.log(`✅ User "${username}" deleted successfully!`);
    return true;
  }
  
  return false;
}

function listUsers() {
  const users = loadUsers();
  
  if (users.length === 0) {
    console.log('📝 No users found.');
    return;
  }
  
  console.log('📋 Current users:');
  console.log('─'.repeat(60));
  users.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username}`);
    console.log(`   Auth Code: ${user.hash}`);
    console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
    console.log('');
  });
}

function showHelp() {
  console.log(`
🎯 Metro Quiz User Management

Usage: node manage-users.js <command> [arguments]

Commands:
  add <username>     Create a new user with auth code
  remove <username>  Delete an existing user  
  list              Show all users and their auth codes
  help              Show this help message

Examples:
  node manage-users.js add alice
  node manage-users.js remove bob
  node manage-users.js list
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'add':
    if (args[1]) {
      addUser(args[1]);
    } else {
      console.error('❌ Please provide a username');
      console.log('Usage: node manage-users.js add <username>');
    }
    break;
    
  case 'remove':
  case 'delete':
    if (args[1]) {
      removeUser(args[1]);
    } else {
      console.error('❌ Please provide a username');
      console.log('Usage: node manage-users.js remove <username>');
    }
    break;
    
  case 'list':
    listUsers();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    console.error('❌ Unknown command');
    showHelp();
    break;
}
