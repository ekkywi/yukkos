import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '../../../application/ports/i-token.service';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: { sub: string; email: string; role: string }): string {
    return this.jwtService.sign(payload);
  }
}