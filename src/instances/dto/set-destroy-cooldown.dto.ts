import { IsNotEmpty } from "class-validator";

export class SetDestroyCooldownDto {

    @IsNotEmpty()
    cooldown: number;
    
}
