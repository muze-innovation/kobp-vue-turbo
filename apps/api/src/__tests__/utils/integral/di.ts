import { MikroORM } from '@mikro-orm/core';
import { DI } from 'kobp'
import RedisCacheAdapter from 'mikro-orm-cache-adapter-redis'

import { config } from '../../../config'
import ormConfig from '../../../db/orm.config'

const makeDbConfig = (/* override option here if ever needed */) => MikroORM.init({
  ...ormConfig,
  resultCache: {
    adapter: RedisCacheAdapter,
    options: config.redisConfig,
    expiration: 2000, // 2 seconds by default.
  },
  debug: config.debug,
})

export const prepareDependencies = async (): Promise<any> => {
  if (!DI.orm) { 
    DI.orm = await makeDbConfig() // CLI config will be used automatically
    DI.em = DI.orm.em
  }
  return DI
}

export const destroyDependencies = async (): Promise<any> => {
  await DI.orm.close()
}
