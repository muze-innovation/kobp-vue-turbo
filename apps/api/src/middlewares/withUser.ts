import {
  ClientErrorCode,
  KobpError,
} from 'kobp'
import {
  Context,
  Middleware,
} from 'koa'

const HEADER_APIGW_TRUEID = 'x-trueid'
const HEADER_APIGW_CRED_TYPE = 'x-cred-type'

export type RequestCredType = 'apikey' | 'admin' | 'user'

export const withUser = (supportCredTypes: RequestCredType[]): Middleware => {
  // TODO: Preparing what ever we needed based on middleware's creation parameters.
  // This is being called only once when middleware is created.
  const requestIsValid: ((context: Context) => boolean)[] = []
  for(const type of supportCredTypes) {
    if (type === 'admin') {
      requestIsValid.push((context) => {
        return context.headers[HEADER_APIGW_CRED_TYPE] === 'admin'
      })
    } else if (type === 'apikey') {
      requestIsValid.push((context) => {
        return context.headers[HEADER_APIGW_CRED_TYPE] === 'admin'
      })
    } else if (type === 'user') {
      requestIsValid.push((context) => {
        return context.headers[HEADER_APIGW_CRED_TYPE] === 'admin' && Boolean(context.headers[HEADER_APIGW_TRUEID])
      })
    }
  }
  // This callback is called upon every incoming requests
  return <Middleware>(async (context, next) => {
    // Actual Middleware code
    if (!(requestIsValid.some((fn) => fn(context)))) {
      throw KobpError.fromUserInput(ClientErrorCode.unauthorized, 'Invalid request!')
    } 
    await next()
  })
}
