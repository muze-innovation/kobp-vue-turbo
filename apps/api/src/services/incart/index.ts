import axios, { AxiosInstance } from 'axios'

import { InCartConfig } from '../../config'
import { Loggy } from 'kobp'
import { omit } from 'lodash'
import { InCartAuthAdminService } from './authAdmin'

export class InCartService {

  private static _instances: { [key: string]: InCartService } = {}

  public static getInstance(config: InCartConfig): InCartService {
    const key = `${config.baseURL}@${config.apiKey}`
    return this._instances[key] || (this._instances[key] = new InCartService(config))
  }

  private _axios: AxiosInstance

  private _authAdmin: InCartAuthAdminService | undefined

  public get authAdmin(): InCartAuthAdminService { return this._authAdmin || (this._authAdmin = new InCartAuthAdminService(this._axios)) }

  private constructor(public readonly conf: InCartConfig) {
    this._axios = axios.create({
      baseURL: conf.baseURL,
      headers: {
        'x-api-key': conf.apiKey
      },
    })

    this._axios.interceptors.request.use((reqConfig) => {
      const { common, ...headers } = omit(reqConfig.headers, 'delete', 'get', 'head', 'post', 'put', 'patch')
      Loggy.log(`INC.REQ> ${reqConfig.method} ${reqConfig.url} H`, { ...common, ...headers }, 'D', reqConfig.data || {}, 'Q', reqConfig.params || {})
      return reqConfig
    })
    this._axios.interceptors.response.use((resp) => {
      Loggy.log(`INC.RESP< ${resp.config.method} ${resp.config.url}`, resp.data)
      return resp
    }, (error) => {
      Loggy.log(`INC.RESP< ${error.response.config.method} ${error.response.config.url}`, error.response.data)
      throw error
    })
  }
}