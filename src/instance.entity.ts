
import { CustomBaseEntity } from "src/custom-base.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

export class Instance extends CustomBaseEntity {
    @Column({ type: 'int', unique: true })
    port: number

    @Column()
    githubUrl: string

    @Column()
    challengeId: string

    @Column()
    composeProjectName: string
}

