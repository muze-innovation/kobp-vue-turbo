import type { KobpServiceState, KobpServiceContext } from 'kobp'

import Router from 'koa-router'
import { makeRoutes as makeV1Routes } from './v1'
import { makeRoutes as makeHealthCheckRoutes } from './healthcheck'

export const makeRoutes = (): Router<KobpServiceState, KobpServiceContext> => {

  const prefix = '/core'

  const api = new Router<KobpServiceState, KobpServiceContext>()
  // Healthcheck APIs
  api.use(`${prefix}/healthcheck`, ...makeHealthCheckRoutes())
  // API v1
  api.use(`${prefix}/v1`, ...makeV1Routes())
  return api
}