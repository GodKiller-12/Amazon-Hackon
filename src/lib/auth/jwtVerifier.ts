import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AuthUser } from './types';

let client: jwksClient.JwksClient | null = null;

function getJwksClient(): jwksClient.JwksClient {
  if (client) return client;

  const region = process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1';
  const userPoolId = process.env.COGNITO_USER_POOL_ID;

  if (!userPoolId) {
    throw new Error('COGNITO_USER_POOL_ID environment variable is not set');
  }

  const jwksUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

  client = jwksClient({
    jwksUri,
    cache: true,
    cacheMaxAge: 600000, // 10 minutes
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  });

  return client;
}

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback): void {
  const jwks = getJwksClient();
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyToken(token: string): Promise<AuthUser> {
  const region = process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1';
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;

  if (!userPoolId) {
    throw new Error('COGNITO_USER_POOL_ID environment variable is not set');
  }

  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        issuer,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(new Error(`Token verification failed: ${err.message}`));
          return;
        }

        const payload = decoded as Record<string, unknown>;

        // Validate token_use is either 'access' or 'id'
        const tokenUse = payload.token_use as string;
        if (tokenUse !== 'access' && tokenUse !== 'id') {
          reject(new Error('Invalid token_use claim'));
          return;
        }

        // For id tokens, validate audience matches client_id
        if (tokenUse === 'id' && clientId && payload.aud !== clientId) {
          reject(new Error('Token audience mismatch'));
          return;
        }

        // For access tokens, validate client_id claim
        if (tokenUse === 'access' && clientId && payload.client_id !== clientId) {
          reject(new Error('Token client_id mismatch'));
          return;
        }

        resolve({
          userId: (payload.sub as string) || '',
          email: payload.email as string | undefined,
          phone: payload.phone_number as string | undefined,
          name: payload.name as string | undefined,
        });
      }
    );
  });
}
