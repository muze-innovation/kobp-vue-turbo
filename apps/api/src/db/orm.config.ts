import type { MikroORMOptions } from '@mikro-orm/core'
import { config } from '../config'
import {
  ProfileEntity,
} from './entities'

export default <Partial<MikroORMOptions>>{
  entities: [
    ProfileEntity,
  ],
  subscribers: [
  ],
  forceUtcTimezone: true,
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  type: 'postgresql', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  replicas: process.env.DB_READ_REPLICAS != "" && process.env.DB_READ_REPLICAS !== undefined ? JSON.parse(process.env.DB_READ_REPLICAS) : [],
  migrations: {
    path:
      process.cwd() +
      `/${process.env.NODE_ENVIRONMENT === 'production' ? 'lib' : 'src'
      }/migrations/`,
    pattern: /^[\w-]+\d+\.[jt]s$/,
    allOrNothing: true,
    disableForeignKeys: false,
  },
  debug: config.debug,
}
