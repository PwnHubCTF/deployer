import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeployInstanceDto {
    @ApiProperty({
        required: true
    })
    @IsNotEmpty()
    githubUrl: string;


    @ApiProperty({
        required: true
    })
    @IsNotEmpty()
    owner: string;

    @ApiProperty({
        required: false
    })
    @IsNotEmpty()
    challengeId: string;

    @ApiProperty({
        required: false
    })
    @IsNotEmpty()
    customEnv?: NodeJS.ProcessEnv;
    
}
