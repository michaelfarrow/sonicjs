import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Album from './Album';
import PlaylistTrack from './PlaylistTrack';

@Entity()
export class Track extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  item: string;

  @Column()
  path: string;

  @Column({
    type: String,
    nullable: true,
  })
  type!: string | null;

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
  rating: number;

  @Column({
    type: Date,
    nullable: true,
  })
  starred!: Date | null;

  @Column({ default: false })
  metaFetched: boolean;

  @Column({
    type: String,
    nullable: true,
  })
  name!: string | null;

  @Column({
    type: String,
    nullable: true,
  })
  artist!: string | null;

  @Column({
    type: String,
    nullable: true,
  })
  albumArtist!: string | null;

  @Column({
    type: Number,
    nullable: true,
  })
  track!: number | null;

  @Column({
    type: Number,
    nullable: true,
  })
  disc!: number | null;

  @Column({
    type: Number,
    nullable: true,
  })
  bitRate!: number | null;

  @Column({
    type: Number,
    nullable: true,
  })
  duration!: number | null;

  @Column({
    type: Number,
    nullable: true,
  })
  size!: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Album, {
    onDelete: 'CASCADE',
  })
  album: Album;

  @OneToMany(() => PlaylistTrack, (playlistTrack) => playlistTrack.track)
  playlistTrack!: PlaylistTrack[];
}

export default Track;
