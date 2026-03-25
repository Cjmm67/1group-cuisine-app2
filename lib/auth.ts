import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

export interface AuthUser {
  email: string;
  name: string;
  role: 'master_admin' | 'admin' | 'chef';
}

interface StoredUser {
  email: string;
  name: string;
  password: string;
  role: 'master_admin' | 'admin';
}

/** Get allowed chef email domains from env (defaults to 1-group.sg) */
function getChefEmailDomains(): string[] {
  const domainsEnv = process.env.CHEF_EMAIL_DOMAINS;
  if (domainsEnv) {
    return domainsEnv.split(',').map((d) => d.trim().toLowerCase());
  }
  return ['1-group.sg'];
}

/** Get all admin users from environment variables */
export function getUsers(): StoredUser[] {
  const users: StoredUser[] = [];

  const masterEmail = process.env.MASTER_ADMIN_EMAIL;
  const masterPassword = process.env.MASTER_ADMIN_PASSWORD;
  if (masterEmail && masterPassword) {
    users.push({
      email: masterEmail.toLowerCase().trim(),
      name: 'Master Admin',
      password: masterPassword,
      role: 'master_admin',
    });
  }

  const adminUsersJson = process.env.ADMIN_USERS;
  if (adminUsersJson) {
    try {
      const adminUsers = JSON.parse(adminUsersJson);
      for (const user of adminUsers) {
        if (user.email && user.password) {
          users.push({
            email: user.email.toLowerCase().trim(),
            name: user.name || user.email.split('@')[0],
            password: user.password,
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

/** Validate login credentials — checks admins first, then chef domain login */
export async function validateCredentials(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check admin users first (master_admin and admin roles)
  const users = getUsers();
  const adminUser = users.find((u) => u.email === normalizedEmail);
  if (adminUser && adminUser.password === password) {
    return {
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    };
  }

  // 2. Check chef domain login (shared password, validated email domain)
  const chefPassword = process.env.CHEF_PASSWORD;
  if (chefPassword && password === chefPassword) {
    const emailDomain = normalizedEmail.split('@')[1];
    const allowedDomains = getChefEmailDomains();
    if (emailDomain && allowedDomains.includes(emailDomain)) {
      return {
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role: 'chef',
      };
    }
  }

  return null;
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
    .setExpirationTime('365d')
    .sign(JWT_SECRET);
}

/** Verify and decode a JWT token */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'master_admin' | 'admin' | 'chef',
    };
  } catch {
    return null;
  }
}
