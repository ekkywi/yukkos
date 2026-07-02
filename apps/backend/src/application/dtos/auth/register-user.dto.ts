import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../domain/entities/user.entity';

export class RegisterUserDto {
    @ApiProperty({ example: 'Budi Sudarsono', description: 'Nama lengkap pengguna' })
    @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
    @IsString()
    name!: string;

    @ApiProperty({ example: 'budi@example.com', description: 'Email unik pengguna' })
    @IsNotEmpty({ message: 'Email tidak boleh kosong' })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email!: string;

    @ApiProperty({ example: 'PasswordKuat123!', minLength: 6 })
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(6, { message: 'Password minimal 6 karakter' })
    password!: string;

    @ApiPropertyOptional({ enum: Role, example: Role.TENANT })
    @IsOptional()
    @IsEnum(Role, {message: 'Role tidak valid' })
    role?: Role;
}