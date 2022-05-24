import {
  KobpServiceContext,
  BaseRoutedController,
  Route,
  KobpError,
  ClientErrorCode,
} from 'kobp'
import {
  withInputBody,
} from '../middlewares/withInputBody'

import {
  IRandomizer,
  Randomizer,
} from '../logic/randomizer'

export namespace Hello {

  export interface Input {
    /**
     * Length of expected output string
     */
    length: number
  }

  export const assertInput = (o: any): o is Input => {
    if (typeof o !== 'object') {
      throw KobpError.fromUserInput(ClientErrorCode.badRequest, 'expected json object')
    }
    if (!o.length) {
      throw KobpError.fromUserInput(ClientErrorCode.badRequest, 'expected length to be numeric value greater than zero')
    }
    return true
  }

  export interface Output {
    /**
     * randomized output string
     */
    output: string
  }
}

export class HelloController extends BaseRoutedController {

  constructor(public readonly randomizer: IRandomizer = new Randomizer()) {
    super()
  }

  @Route({
    method: 'post',
    path: '/',
    middlewares: [
      withInputBody(Hello.assertInput),
    ],
  })
  public async init(context: KobpServiceContext): Promise<Hello.Output> {
    const body = context.body as Hello.Input
    return {
      output: this.randomizer.basic(body.length)
    }
  }
}