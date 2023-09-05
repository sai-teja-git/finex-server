import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    user_name: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    time_zone_id: string;

    @IsString()
    @IsNotEmpty()
    time_zone: string;

    @IsString()
    @IsNotEmpty()
    time_zone_gmt_time: string;

    @IsNumber()
    @IsNotEmpty()
    time_zone_gmt_minutes: number;

    @IsNumber()
    @IsNotEmpty()
    currency_decimal_digits: number;

    @IsString()
    @IsNotEmpty()
    currency_id: string;

    @IsString()
    @IsNotEmpty()
    currency_name: string;

    @IsString()
    @IsNotEmpty()
    currency_name_plural: string;

    @IsString()
    @IsNotEmpty()
    currency_code: string;

    @IsString()
    currency_icon_class: string;

    @IsString()
    @IsNotEmpty()
    currency_html_code: string;
}

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    user_name: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}