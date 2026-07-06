import http from '../infrastructure/http';

export type AuthRole = 'PROVIDER' | 'TENANT' | string;

export type AuthResponse = {
  accessToken: string;
  role: AuthRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: 'TENANT';
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const readAuthPayload = (value: unknown): AuthResponse => {
  const root = isRecord(value) ? value : {};
  const nested = isRecord(root.data) ? root.data : root;
  const deepNested = isRecord(nested.data) ? nested.data : nested;

  const accessToken =
    typeof deepNested.accessToken === 'string'
      ? deepNested.accessToken
      : typeof deepNested.access_token === 'string'
        ? deepNested.access_token
        : typeof nested.accessToken === 'string'
          ? nested.accessToken
          : typeof nested.access_token === 'string'
            ? nested.access_token
            : typeof root.accessToken === 'string'
              ? root.accessToken
              : typeof root.access_token === 'string'
                ? root.access_token
                : '';

  const role =
    typeof deepNested.role === 'string'
      ? deepNested.role
      : typeof nested.role === 'string'
        ? nested.role
        : typeof root.role === 'string'
          ? root.role
          : '';

  return {
    accessToken,
    role,
  };
};

export const login = async (payload: LoginInput): Promise<AuthResponse> => {
  const response = await http.post('/v1/auth/login', payload);
  return readAuthPayload(response.data);
};

export const register = async (payload: RegisterInput): Promise<AuthResponse> => {
  const response = await http.post('/v1/auth/register', payload);
  return readAuthPayload(response.data);
};
