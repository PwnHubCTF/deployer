
import { CustomBaseEntity } from "src/custom-base.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { Instance } from "./instance.entity";

@Entity()
export class InstanceMultiple extends Instance {
    @Column()
    team: string

    @Column({ unique: true })
    owner: string
}

