import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateKeyDto {
    @ApiProperty({
        required: true,
    })
    @IsNotEmpty()
    key: string

    @ApiProperty({
        required: true,
    })
    @IsNotEmpty()
    value: string
}
