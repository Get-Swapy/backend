import { IsString } from 'class-validator';

export class RegisterNetworkDto {
  @IsString()
  name: string;
}
