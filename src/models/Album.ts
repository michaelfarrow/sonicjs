import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { sortName } from '@/utils/library';

import Artist from './Artist';
import Track from './Track';
import Image from './Image';
import Genre from './Genre';

@Entity()
export class Album extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  item: string;

  @Column()
  path: string;

  @Column({
    type: Date,
    nullable: true,
  })
  starred!: Date | null;

  @Column({
    type: Number,
    default: 0,
  })
  plays: number;

  @Column({
    type: Date,
    nullable: true,
  })
  lastPlayed!: Date | null;

  @Column({
    type: Number,
    default: 0,
  })
  rand: number;

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
    type: Number,
    nullable: true,
  })
  year!: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Artist)
  artist: Artist;

  @OneToMany(() => Track, (track) => track.album)
  tracks: Track[];

  @OneToOne(() => Image, { onDelete: 'SET NULL' })
  @JoinColumn()
  image!: Image | null;

  @ManyToMany(() => Genre, (genre) => genre.albums)
  @JoinTable()
  genres: Genre[];

  get trackCount() {
    return this.tracks?.length || 0;
  }

  get duration() {
    return (
      this.tracks?.reduce(
        (acc, current) => (acc += current.duration || 0),
        0
      ) || 0
    );
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateSortName() {
    this.sortName = sortName(this.name || this.item);
  }
}

export default Album;
