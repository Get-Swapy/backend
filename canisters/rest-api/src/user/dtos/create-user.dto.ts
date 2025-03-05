import { IsEnum, IsString } from 'class-validator';

export enum Platform {
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
}

export class CreateUserDto {
  @IsEnum(Platform)
  public platform: Platform;

  @IsString()
  public externalId: string;
}
