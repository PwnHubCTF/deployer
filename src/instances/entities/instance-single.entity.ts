
import { CustomBaseEntity } from "src/custom-base.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { Instance } from "./instance.entity";

@Entity()
export class InstanceSingle extends Instance {

}

