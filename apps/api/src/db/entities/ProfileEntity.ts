import {
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'

@Entity()
export class ProfileEntity {

  @PrimaryKey({
    columnType: 'varchar(40)',
    primary: true,
    nullable: false,
  })
  profileId!: string

  @Property({
    columnType: 'varchar(40)',
    nullable: false,
  })
  name!: string

  @Property({
    columnType: 'timestamp',
    nullable: false,
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date()
}
