export const I_TOKEN_SERVICE = 'ITokenService';

export interface ITokenService {
    generateToken(payload: { sub: string; email: string; role: string }): string;
}