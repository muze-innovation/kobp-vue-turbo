import { Migration } from '@mikro-orm/migrations';

export class Migration20220524164009 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "profile_entity" ("profile_id" varchar(40) not null, "name" varchar(40) not null, "updated_at" timestamp not null);');
    this.addSql('alter table "profile_entity" add constraint "profile_entity_pkey" primary key ("profile_id");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "profile_entity";')
  }
}
