import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

export interface AuthUser {
  email: string;
  name: string;
  role: 'master_admin' | 'admin';
}

interface StoredUser {
  email: string;
  name: string;
  passwordHash: string;
  role: 'master_admin' | 'admin';
}

/** Get all users from environment variables */
export function getUsers(): StoredUser[] {
  const users: StoredUser[] = [];

  // Master admin from dedicated env vars
  const masterEmail = process.env.MASTER_ADMIN_EMAIL;
  const masterPassword = process.env.MASTER_ADMIN_PASSWORD;
  if (masterEmail && masterPassword) {
    users.push({
      email: masterEmail.toLowerCase(),
      name: 'Master Admin',
      passwordHash: bcrypt.hashSync(masterPassword, 10),
      role: 'master_admin',
    });
  }

  // Additional admin users from JSON env var
  // Format: [{"email":"x@y.com","name":"Name","password":"pass"}]
  const adminUsersJson = process.env.ADMIN_USERS;
  if (adminUsersJson) {
    try {
      const adminUsers = JSON.parse(adminUsersJson);
      for (const user of adminUsers) {
        if (user.email && user.password) {
          users.push({
            email: user.email.toLowerCase(),
            name: user.name || user.email.split('@')[0],
            passwordHash: bcrypt.hashSync(user.password, 10),
            role: 'admin',
          });
        }
      }
    } catch {
      console.error('Failed to parse ADMIN_USERS env var');
    }
  }

  return users;
}

/** Validate login credentials */
export async function validateCredentials(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const users = getUsers();
  const user = users.find((u) => u.email === email.toLowerCase());

  if (!user) return null;

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) return null;

  return {
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/** Create a signed JWT token */
export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/** Verify and decode a JWT token */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'master_admin' | 'admin',
    };
  } catch {
    return null;
  }
}
