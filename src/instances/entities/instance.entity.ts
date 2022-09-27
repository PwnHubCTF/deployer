
import { CustomBaseEntity } from "src/custom-base.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
    name: 'instance',
})
export class Instance extends CustomBaseEntity {
    @Column({ type: 'text' })
    owner: string

    @Column({ type: 'int' })
    port: number

    @Column({ type: 'text' })
    githubUrl: string
}

