import type { RedisOptions } from 'ioredis'
import { env } from 'kobp'
import type * as Kafka from 'kafkajs'

export interface KafkaConfig {
  client: Kafka.KafkaConfig
  topicNames: {
    backInStock: string
  }
}

export interface AppConfig {
  debug: boolean
  redisConfig?: RedisOptions & { debug: boolean, namespace: string, useCluster: boolean };
  kafka: KafkaConfig
}

// Global Flags
const debug = env.b('DB_DEBUG', false)

// Output of config module
export const config: AppConfig = {
  debug,
  redisConfig: {
    host: env.s('REDIS_HOST', 'localhost'),
    port: env.n('REDIS_PORT', 6379),
    password: env.s('REDIS_PASSWORD', ''),
    useCluster: /^(qa|prod)$/.test(env.s('STAGE', 'dev')),
    namespace: 'lvcmr_core',
    debug,
  },
  kafka: {
    client: {
      clientId: 'superapp-kafkajs-profile',
      brokers: env.s('KAFKA_NODES', '').split(',').map((o) => o.trim()).filter(Boolean),
    },
    topicNames: {
      backInStock: env.s('KAFKA_TOPIC_BACK_IN_STOCK', 'topic-back-in-stock'),
    }
  },
}