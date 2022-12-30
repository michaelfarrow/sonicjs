import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { sortName } from '@/utils/library';

import Album from './Album';
import Image from './Image';

@Entity()
export class Artist extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  item: string;

  @Column()
  path: string;

  @Column({ default: false })
  metaFetched: boolean;

  @Column({
    type: String,
    nullable: true,
  })
  name!: string | null;

  @Column()
  sortName: string;

  @Column({
    type: String,
    nullable: true,
  })
  bio!: string | null;

  @Column({
    type: Date,
    nullable: true,
  })
  starred!: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Album, (album) => album.artist)
  albums: Album[];

  @OneToOne(() => Image, { onDelete: 'SET NULL' })
  @JoinColumn()
  image!: Image | null;

  get albumCount() {
    return this.albums?.length || 0;
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateSortName() {
    this.sortName = sortName(this.name || this.item);
  }
}

export default Artist;
