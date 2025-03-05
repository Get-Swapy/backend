import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  networks: string[];
}
