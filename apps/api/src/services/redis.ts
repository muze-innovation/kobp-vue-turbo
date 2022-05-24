import Redis from 'ioredis'
import { KobpError, Loggy, ServerErrorCode } from 'kobp'
import isNil from 'lodash/isNil'
import { config } from '../config'

type Resolver<T> = () => Promise<T>

const makeClient = (): Redis.Redis | Redis.Cluster => {
  return !config.redisConfig?.useCluster
    ? new Redis({
      ...config.redisConfig,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    })
    : new Redis.Cluster([
      {
        host: config.redisConfig?.host,
        port: config.redisConfig?.port
      }],
      {
        redisOptions: {
          ...config.redisConfig,
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          }
        }
      }
    )
}

export class RedisService {

  private static _instnace: RedisService | undefined

  public static shared(): RedisService {
    return RedisService._instnace || (RedisService._instnace = new RedisService())
  }

  public readonly client: Redis.Redis | Redis.Cluster
  private readonly namespace: string

  /**
   * https://redis.io/commands/set
   */
  public constructor() {
    this.namespace = config.redisConfig?.namespace || ''
    this.client = makeClient()
  }
  

  /**
   * once call this method and save the result for only once.
   *
   * @param key 
   * @param resolve 
   */
  public async once<T>(key: string, resolve: Resolver<T>): Promise<T>
  public async once<T>(key: string, ttlInSeconds: number, resolve: Resolver<T>): Promise<T>
  public async once<T>(rawKey: string, ttlInSecondsOrResolver: number | Resolver<T>, resolve?: Resolver<T>): Promise<T> {
    const key = this._makeKey(rawKey)
    // Found
    const found = await this.client.get(key)
    if (found) {
      Loggy.log('REDIS H', key)
      return JSON.parse(found)
    }
    Loggy.log('REDIS M', key)

    // Not-Found
    const rsolv: Resolver<T> | undefined = typeof ttlInSecondsOrResolver === 'number'
      ? resolve
      : ttlInSecondsOrResolver
    const ttlInSeconds: number = typeof ttlInSecondsOrResolver === 'number'
      ? ttlInSecondsOrResolver
      : 0
    if (!rsolv) throw KobpError.fromServer(ServerErrorCode.internalServerError, 'Invalid use of "once" method. Have you pass the valid resolver?')
    const val = await rsolv()
    const toSave = JSON.stringify(val)
    if (ttlInSeconds) {
      await this.client.set(key, toSave, 'EX', ttlInSeconds)
    } else {
      await this.client.set(key, toSave)
    }
    return val
  }

  public async get<T>(key: string): Promise<T | null>
  public async get<T>(key: string, otherwise: T): Promise<T>
  public async get<T>(rawKey: string, otherwise: T | null = null): Promise<T | null> {
    const key = this._makeKey(rawKey)
    const found = await this.client.get(key)
    if (found) {
      Loggy.log('REDIS H', key)
      return JSON.parse(found)
    }
    Loggy.log('REDIS M', key)
    return !isNil(otherwise) ? otherwise : null
  }

  public async unset(rawKey: string): Promise<void> {
    const key = this._makeKey(rawKey)
    await this.client.del(key)
  }

  public async set<T>(rawKey: string, val: T, expInSeconds: number): Promise<void> {
    const key = this._makeKey(rawKey)
    await this.client.set(key, JSON.stringify(val), 'EX', expInSeconds)
  }

  public async decr(rawKey: string): Promise<number> {
    const key = this._makeKey(rawKey)
    return await this.client.decr(key)
  }

  public async incr(rawKey: string): Promise<number> {
    const key = this._makeKey(rawKey)
    return await this.client.incr(key)
  }

  // Inject value into set.
  /**
   * Add multiple items into Redis' set.
   * 
   * @ref https://redis.io/topics/data-types
   * @param key 
   * @param val 
   */
  public async setAdd(rawKey: string, ...val: string[]): Promise<number> {
    const key = this._makeKey(rawKey)
    return await this.client.sadd(key, val)
  }

  /**
   * Remove multiple items
   * 
   * @param rawKey 
   * @param val 
   * @returns 
   */
  public async setRemove(rawKey: string, ...val: string[]): Promise<any> {
    const key = this._makeKey(rawKey)
    return await this.client.srem(key, val)
  }

  /**
   * Get cadinality of Set key.
   * @param rawKey 
   * @returns 
   */
  public async setCardinal(rawKey: string): Promise<number> {
    const key = this._makeKey(rawKey)
    return await this.client.scard(key)
  }

  /**
   * Get all member of specific set.
   * @param rawKey 
   * @returns 
   */
  public async getSetMembers(rawKey: string): Promise<any> {
    const key = this._makeKey(rawKey)
    return await this.client.smembers(key)
  }

  public async hashGet(rawKey: string, ...valueKeys: string[]): Promise<(string | null)[]> {
    const key = this._makeKey(rawKey)
    return await this.client.hmget(key, valueKeys)
  }

  public async hashSet(rawKey: string, value: { [key: string]: string }): Promise<'OK'> {
    const key = this._makeKey(rawKey)
    return await this.client.hmset(key, value)
  }

  public async hashRemove(rawKey: string, ...value: string[]): Promise<number> {
    const key = this._makeKey(rawKey)
    return await this.client.hdel(key, value)
  }

  public async sortSetAdd(rawKey: string, value: any[]): Promise<any> {
    const key = this._makeKey(rawKey)
    return await this.client.zadd(key, value)
  }

  public async getSortSetAsc(rawKey: string, start: number = 0, stop: number = -1): Promise<string[]> {
    const key = this._makeKey(rawKey)
    return await this.client.zrange(key, start, stop)
  }

  public async getSortSetDesc(rawKey: string, start: number = 0, stop: number = -1): Promise<string[]> {
    const key = this._makeKey(rawKey)
    return await this.client.zrevrange(key, start, stop)
  }

  public async sortSetRemove(rawKey: string, ...value: string[]): Promise<number> {
    const key = this._makeKey(rawKey)
    return await this.client.zrem(key, value)
  }

  public subscribe(channel: string | string[], cb: (err: any, count: number) => number): void {
    this.client.subscribe(channel, cb)
  }

  /**
   * Register a `on` hook, and return the cancellable function.
   * 
   * @param channel 
   * @param cb 
   * @returns 
   */
  public on<T>(channel: string, cb: (channel: string, message: string) => void): (() => void) {
    this.client.on(channel, cb)
    return () => {
      this.client.off(channel, cb)
    }
  }

  public async publishJson(channel: string, message: any, delay: number = 0): Promise<number> {
    Loggy.log('PUBLISH MESSAGE channel=', channel, 'message=', message, 'delay=', delay)
    return this.publish(channel, JSON.stringify(message), delay)
  }

  public async publish(channel: string, message: string, delay: number = 0): Promise<number> {
    return new Promise((resolve, reject) => {
      const publishFunc = () => {
        try {
          this.client.publish(channel, message, (err, res) => {
            if (err) {
              Loggy.error('publish Push Notification returns with error', err)
              reject(err)
            } else {
              resolve(res)
            }
          })
        } catch (e) {
          Loggy.error('publish Push Notification failed', e as any)
          reject(e)
        }
      }
      if (delay) {
        setTimeout(publishFunc, delay)
      } else {
        publishFunc()
      }
    })
  }

  private _makeKey(rawKey: string): string {
    return this.namespace
      ? `${this.namespace}:${rawKey}`
      : `${rawKey}`
  }
}