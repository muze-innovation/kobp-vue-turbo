import { ProfileEntity } from './db/entities/ProfileEntity'

declare module "kobp" {

  interface UserIdiom {
    trueId?: string
    credType: 'admin' | 'apikey' | 'user'
  }

  interface KobpServiceContext {
    idiom: UserIdiom
  }
}