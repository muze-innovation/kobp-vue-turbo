import type { AxiosInstance } from 'axios'
import axios from 'axios'

export interface APIResponse {
  httpStatusCode: number
}

export interface APIObjectResponse extends APIResponse {
  data: {
    [key: string]: any
  }
}

export interface APIArrayResponse extends APIResponse {
  data: any[]
}

export interface APIArrayWithCountResponse extends APIResponse {
  items: any[]
  count: number
}

export interface APIStringWithCountResponse extends APIResponse {
  data: string
}

export class SVClient {
 
  axios: AxiosInstance

  accessToken!: string

  constructor(private readonly conf: { host: string }) {
    this.axios = this.recreateAxios('empty')
  }

  private recreateAxios(accessToken: string) {
    return this.axios = axios.create({
      baseURL: `${this.conf.host}/`,
      validateStatus: () => true,
      headers: {
        'x-api-token': accessToken,
      }
    })
  }

  public async getProfile(profileId: string): Promise<APIObjectResponse> {
    const resp = await this.axios.get(`/v1/profiles/${profileId}`)
    return { httpStatusCode: resp.status,  data: resp.data.data }
  }

  public async createProfile(profileId: string, name: string): Promise<APIObjectResponse> {
    const resp = await this.axios.post(`/v1/profiles/`, {
      profileId,
      name,
    })
    console.log('RESP.data', JSON.stringify(resp.data.data))
    return { httpStatusCode: resp.status, data: resp.data.data }
  }

  public async updateProfile(profileId: string, name: string): Promise<APIObjectResponse> {
    const resp = await this.axios.post(`/v1/profiles/${profileId}`, {
      name,
    })
    return { httpStatusCode: resp.status, data: resp.data.data }
  }

  public async deleteProfile(profileId: string): Promise<APIObjectResponse> {
    const resp = await this.axios.delete(`/v1/profiles/${profileId}`)
    return { httpStatusCode: resp.status, data: resp.data.data }
  }

  public async listProfiles(): Promise<APIArrayWithCountResponse> {
    const resp = await this.axios.get(`/v1/profiles/`)
    return {
      httpStatusCode: resp.status,
      items: resp.data.items,
      count: resp.data.count,
    }
  }
}