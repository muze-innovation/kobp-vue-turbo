import type { Middleware } from 'koa'
import { ClientErrorCode, KobpError } from 'kobp'

/**
 * Validate if given input body matched required input format
 * This middleware will also make sure that body is placed in ctx.body.
 */
export const withInputBody = <T>(assertBodyFn: (o: any) => o is T, forceJsonBodyOnly: boolean = true): Middleware => {
  return async function (ctx, next) {
    let jsonBody = ctx.request.body
    if (!assertBodyFn(jsonBody)) {
      throw KobpError.fromUserInput(ClientErrorCode.badRequest, 'Invalid request body.')
    }
    ctx.body = jsonBody
    await next()
  }
}