import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
    name: 'success',
})
export class Success {
    @PrimaryColumn({ length: 50, unique: true })
    key: string;

    @Column({ length: 150 })
    value: string;

}

