
import { Column, Entity, PrimaryColumn } from "typeorm";
import { Instance } from "../../instance.entity";

@Entity()
export class InstanceMultiple extends Instance {
    @Column()
    owner: string

    @Column()
    destroyAt: Date;
}

