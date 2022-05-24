import type { IMiddleware } from 'koa-router'
import Router from 'koa-router'

import Redis from 'ioredis'
import { config } from '../config'
import { MikroORM } from '@mikro-orm/core'
import ormConfig from '../db/orm.config'
import { ProfileEntity } from '../db/entities'

let _redis: Redis.Redis | null = null
let _mkr: MikroORM | null = null
const probeList: Set<'RDS' | 'REDIS'> = new Set([
  'REDIS'
])


const probeRedisConnection = async (): Promise<boolean> => {
  if (!probeList.has('REDIS')) {
    // ignore
    return true
  }
  _redis = _redis || new Redis(config.redisConfig)
  const value = await _redis.set('stamp', new Date().getTime())
  return value === 'OK'
}
const probeRdsConnection = async (): Promise<boolean> => {
  if (probeList.has('RDS')) {
    _mkr = _mkr || await MikroORM.init(ormConfig)
    const isConnected = await _mkr.isConnected()
    if (!isConnected) {
      await _mkr.connect()
    }
    await _mkr.em.getRepository(ProfileEntity)
      .find({}, { cache: false, limit: 1 })
  }
  return true
}
const healthCheckTranslator = (result: PromiseSettledResult<boolean>): 'OK' | string => {
  if (result.status === 'fulfilled') {
    return result.value ? 'OK' : `Unknown status: ${JSON.stringify(result.value)}`
  }
  return result.reason
}

export const probe = async (): Promise<string[]> => {
  const [
    redisResult,
    rdsResult,
  ] = await Promise.allSettled([
    probeRedisConnection(),
    probeRdsConnection(),
  ])

  return [
    `REDIS = ${healthCheckTranslator(redisResult)}`,
    `RDS = ${healthCheckTranslator(rdsResult)}`,
  ]
}

export const makeRoutes = (): IMiddleware[] => {
  const api = new Router()
  /**
   * Perform Connection Check to
   * 1. Redis
   * 2. RDS
   */
  api.get('/ready', async (context) => {
    const result = await probe()
    // Transform to result
    context.res.statusCode = 200
    context.res.write(result.join('\n'))
    context.res.end()
  })
  return [api.routes(), api.allowedMethods()]
}