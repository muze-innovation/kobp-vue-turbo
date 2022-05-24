import { makeServer, withJsonConfig, KobpError, ServerErrorCode, Loggy } from 'kobp'
import { MikroORM } from '@mikro-orm/core'
import RedisCacheAdapter from 'mikro-orm-cache-adapter-redis'

import { config } from './config'
import { RedisService } from './services/redis'
import ormConfig from './db/orm.config'

import { makeRoutes } from './routes'

const makeDbConfig = () => MikroORM.init({
  ...ormConfig,
  resultCache: {
    adapter: RedisCacheAdapter,
    options: {
      client: RedisService.shared().client
    },
    expiration: 5000, // 2 seconds by default.
  },
  debug: config.debug,
})

// Override withJsonError handling
withJsonConfig.errorPipeline.push(
  (err: any, loggy?: Loggy): Error => {
    if (err instanceof KobpError) {
      return err
    }
    // for any Non-Kobp error wrap it.
    // Produce simple error message;
    if (loggy) {
      const traceId = loggy.traceId
      loggy.error('Internal Server Error: ', err)
      const traceIdMessage = traceId && `. traceId: ${traceId}` || ''
      return KobpError.fromServer(ServerErrorCode.internalServerError, `Something went wrong${traceIdMessage}`, {
        traceId,
      })
    }
    return KobpError.fromServer(ServerErrorCode.internalServerError, `Something went wrong.`)
  }
)

// Finally
makeServer(
  makeDbConfig,
  makeRoutes() as any,
  {
    port: +(process.env.port || 3000),
  },
)
