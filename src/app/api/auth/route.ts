import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  username: string;
  hash: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { authCode } = await request.json();
    
    if (!authCode) {
      return NextResponse.json(
        { error: 'Auth code is required' },
        { status: 400 }
      );
    }
    
    // Load users from JSON file
    const usersFilePath = path.join(process.cwd(), 'src/data/users.json');
    
    if (!fs.existsSync(usersFilePath)) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      );
    }
    
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    const users: User[] = JSON.parse(usersData);
    
    // Find user by auth code
    const user = users.find(u => u.hash === authCode.trim());
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid auth code' },
        { status: 401 }
      );
    }
    
    // Return user data (without the hash for security)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
