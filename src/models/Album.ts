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
import { TrackRepository } from '@/db';

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

  @Column({
    type: Number,
    default: 0,
  })
  trackCount: number;

  @Column({
    type: Number,
    default: 0,
  })
  duration: number;

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

  @BeforeInsert()
  @BeforeUpdate()
  updateSortName() {
    this.sortName = sortName(this.name || this.item);
  }

  async updateTrackInfo() {
    const tracksQuery = TrackRepository.getAll()
      .where((t) => t.album)
      .equal(this.id);

    this.trackCount = await tracksQuery.count().catch((e) => {
      throw e;
    });

    this.duration = (
      await tracksQuery.toPromise().catch((e) => {
        throw e;
      })
    )
      .map((t) => t.duration || 0)
      .reduce((acc, current) => (acc += current), 0);
  }
}

export default Album;
