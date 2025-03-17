import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public externalId: string;
}
