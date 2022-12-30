import { Entity, BaseEntity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import Album from './Album';

@Entity()
export class Genre extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Album, (album) => album.genres)
  albums: Album[];

  get albumCount() {
    return this.albums?.length || 0;
  }

  get songCount() {
    return (
      this.albums?.reduce(
        (acc, current) => (acc += current.tracks?.length || 0),
        0
      ) || 0
    );
  }
}

export default Genre;
