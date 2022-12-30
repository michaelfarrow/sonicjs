import { Entity, BaseEntity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Image extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  path: string;

  @Column()
  hash: string;
}

export default Image;
