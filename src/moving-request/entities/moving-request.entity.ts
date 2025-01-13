import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MovingRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column()
  movingDate: Date;

  @Column()
  pickupAddress: string;

  @Column()
  dropOffAddress: string;

  @Column()
  pickupLatitude: number;

  @Column()
  pickupLongitude: number;

  @Column()
  movingAddress: string;
}
