import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { SignupRequest, LoginRequest, VerifyOtpRequest, TokenResponse, AuthUser } from './types';

function getClient(): CognitoIdentityProviderClient {
  const region = process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1';
  return new CognitoIdentityProviderClient({ region });
}

function getClientId(): string {
  const clientId = process.env.COGNITO_CLIENT_ID;
  if (!clientId) {
    throw new Error('COGNITO_CLIENT_ID environment variable is not set');
  }
  return clientId;
}

export async function signup(
  request: SignupRequest
): Promise<{ userSub: string; codeDeliveryDetails: string }> {
  const client = getClient();
  const clientId = getClientId();

  const userAttributes = [
    { Name: 'phone_number', Value: request.phone },
    { Name: 'name', Value: request.name },
  ];

  if (request.email) {
    userAttributes.push({ Name: 'email', Value: request.email });
  }

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: request.phone,
    Password: request.password,
    UserAttributes: userAttributes,
  });

  const response = await client.send(command);

  return {
    userSub: response.UserSub || '',
    codeDeliveryDetails: response.CodeDeliveryDetails?.Destination || '',
  };
}

export async function confirmSignup(request: VerifyOtpRequest): Promise<void> {
  const client = getClient();
  const clientId = getClientId();

  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: request.username,
    ConfirmationCode: request.code,
  });

  await client.send(command);
}

export async function login(request: LoginRequest): Promise<TokenResponse> {
  const client = getClient();
  const clientId = getClientId();

  const command = new InitiateAuthCommand({
    ClientId: clientId,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: request.username,
      PASSWORD: request.password,
    },
  });

  const response = await client.send(command);
  const result = response.AuthenticationResult;

  if (!result) {
    throw new Error('Authentication failed: no tokens returned');
  }

  return {
    accessToken: result.AccessToken || '',
    idToken: result.IdToken || '',
    refreshToken: result.RefreshToken || '',
    expiresIn: result.ExpiresIn || 3600,
  };
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const client = getClient();
  const clientId = getClientId();

  const command = new InitiateAuthCommand({
    ClientId: clientId,
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });

  const response = await client.send(command);
  const result = response.AuthenticationResult;

  if (!result) {
    throw new Error('Token refresh failed: no tokens returned');
  }

  return {
    accessToken: result.AccessToken || '',
    idToken: result.IdToken || '',
    refreshToken: refreshToken, // refresh token is not rotated
    expiresIn: result.ExpiresIn || 3600,
  };
}

export async function getUser(accessToken: string): Promise<AuthUser> {
  const client = getClient();

  const command = new GetUserCommand({
    AccessToken: accessToken,
  });

  const response = await client.send(command);

  const attributes = response.UserAttributes || [];
  const getAttr = (name: string) => attributes.find((a) => a.Name === name)?.Value;

  return {
    userId: getAttr('sub') || '',
    email: getAttr('email'),
    phone: getAttr('phone_number'),
    name: getAttr('name'),
  };
}
