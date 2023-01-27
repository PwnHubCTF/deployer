import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeployAdminInstanceDto {
    @ApiProperty({
        required: true
    })
    @IsNotEmpty()
    githubUrl: string;

    @ApiProperty({
        required: false
    })
    @IsNotEmpty()
    challengeId: string;
}
