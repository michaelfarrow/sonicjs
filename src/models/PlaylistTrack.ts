import {
  BaseEntity,
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Playlist from './Playlist';
import Track from './Track';

@Entity()
export default class PlaylistTrack extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playlistId: number;

  @Column()
  trackId: string;

  @ManyToOne(() => Playlist, (playlist) => playlist.tracks, {
    onDelete: 'CASCADE',
  })
  playlist!: Playlist;

  @ManyToOne(() => Track, (track) => track.playlistTrack, {
    onDelete: 'CASCADE',
  })
  track!: Track;
}
