
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
    name: 'instance',
})
export class Instance {
    @Column({ type: 'string' })
    owner: string

    @Column({ type: 'int' })
    port: number
}

