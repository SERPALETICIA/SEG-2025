import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 60, nullable: false})
  name: string;

  @Column({nullable: false})
  email: string;

  @Column({type: 'uuid', nullable: false, unique: true})
  supabaseId: string;

  @Column({default: false})
  hasMFA: boolean;

  @Column({nullable: true})
  mfaFactorId: string;

  @Column({default: false})
  isMfaSetupComplete: boolean;
}