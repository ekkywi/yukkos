import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({ example: 'budi@example.com', description: 'Email pengguna terdaftar' })
    @IsNotEmpty({ message: 'Email tidak boleh kosong' })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email!: string;

    @ApiProperty({ example: 'PasswordKuat123!', description: 'Kata Sandi' })
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @IsString()
    password!: string;
}