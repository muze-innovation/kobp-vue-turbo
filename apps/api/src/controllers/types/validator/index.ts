import { ClientErrorCode, KobpError } from 'kobp'
import isNil from 'lodash/isNil'
import isBoolean from 'lodash/isBoolean'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

const throwWhen = (evalToTrueToThrow: boolean, errorMessage: string) => {
  if (evalToTrueToThrow) {
    throw KobpError.fromUserInput(ClientErrorCode.badRequest, `${errorMessage}`)
  }
}

const throwWhenDefined = (obj: any, key: string, evalToTrue: (val: any) => boolean , errorMessage: string) => {
  const val = get(obj, key, undefined)
  if (typeof val === 'undefined') {
    return
  }
  throwWhen(!evalToTrue(val), errorMessage)
}

export const assert = {
  required: (value: any, fieldPath: string) => throwWhen(isNil(get(value, fieldPath)), `Field ${fieldPath} is required.`),
  isArray: (value: any, fieldPath: string) => throwWhenDefined(value, fieldPath, Array.isArray, `Field ${fieldPath} must be array.`),
  isString: (value: any, fieldPath: string) => throwWhen(get(value, fieldPath) && typeof get(value, fieldPath) !== 'string', `Field ${fieldPath} must be string.`),
  isNotEmpty: (value: any, fieldPath: string) => throwWhen(isEmpty(get(value, fieldPath)), `Field ${fieldPath} must not be empty.`),
  matched: (value: any, fieldPath: string, pattern: RegExp) => throwWhenDefined(value, fieldPath, (val) => pattern.test(val), `Field ${fieldPath} must be string and matched: ${pattern}, got ${get(value, fieldPath)}`),
  isBoolean: (value: any, fieldPath: string) => throwWhenDefined(value, fieldPath, (val) => (typeof val === 'string' || typeof val === 'number') ? /^(yes|no|1|0|true|false)$/i.test(`${val}`) : isBoolean(val), `Field ${fieldPath} must be boolean.`),
}