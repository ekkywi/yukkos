import { SetMetadata } from "@nestjs/common";
import { Role } from '../../domain/entities/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: (Role | string)[]) => SetMetadata(ROLES_KEY, roles);