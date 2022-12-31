import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import PlaylistsTracks from './PlaylistTrack';

@Entity()
export class Playlist extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: String,
  })
  name: string;

  @Column({
    type: String,
    nullable: true,
  })
  comment!: string | null;

  @Column({
    default: true,
  })
  public: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PlaylistsTracks, (playlistTracks) => playlistTracks.playlist)
  tracks!: PlaylistsTracks[];

  get trackCount() {
    return this.tracks?.length || 0;
  }

  get duration() {
    return (
      this.tracks?.reduce(
        (acc, current) => (acc += current.track?.duration || 0),
        0
      ) || 0
    );
  }
}

export default Playlist;
