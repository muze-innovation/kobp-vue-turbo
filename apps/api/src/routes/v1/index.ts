import type {
  KobpServiceState,
  KobpServiceContext,
} from 'kobp'
import Router, { IMiddleware } from 'koa-router'

import {
  ProfileController,
  HelloController,
} from '../../controllers'

export const makeRoutes = (): IMiddleware<KobpServiceState, KobpServiceContext>[] => {
  const api = new Router<KobpServiceState, KobpServiceContext>();
  api.use('/profiles', ...new ProfileController().getMiddlewares())
  api.use('/hello', ...new HelloController().getMiddlewares())

  return [api.routes(), api.allowedMethods()]
}
