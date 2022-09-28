
import { CustomBaseEntity } from "src/custom-base.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
    name: 'instances',
})
export class Instance extends CustomBaseEntity {
    @Column()
    team: string

    @Column({ unique: true })
    owner: string

    @Column({ type: 'int', unique: true })
    port: number

    @Column()
    githubUrl: string

    @Column()
    challengeId: string

    @Column()
    composeProjectName: string
}

