import type { AxiosInstance } from 'axios'
import { Deserialize } from 'cerialize'
import { InCartAccessTokenResponse } from './models/authAdmin'

export class InCartAuthAdminService {

  public constructor(readonly axios: AxiosInstance) {
  }

  public async login(email: string, password: string): Promise<InCartAccessTokenResponse> {
    const resp = await this.axios.post('/pcms/api/v1/auth/admin/access-tokens', {
      email,
      password,
    }, {
      headers: {
        'x-api-key': '',
      }
    })
    const r: InCartAccessTokenResponse = Deserialize(resp.data, InCartAccessTokenResponse)
    return r
  }

  public async oAuthExchange(provider: string, accessToken: string): Promise<InCartAccessTokenResponse> {
    const resp = await this.axios.post(`/pcms/api/v1/auth/admin/access-tokens/oauth/${provider}/exchange`, {
      accessToken,
    }, {
      headers: {
        authorization: '',
      }
    })
    const r: InCartAccessTokenResponse = Deserialize(resp.data, InCartAccessTokenResponse)
    return r
  }

  public async refresh(accessToken: string, refreshToken: string): Promise<InCartAccessTokenResponse> {
    const resp = await this.axios.post('/pcms/api/v1/auth/admin/refresh-token', {
      refreshToken,
    }, {
      headers: {
        authorization: `${accessToken}`,
      }
    })
    const r: InCartAccessTokenResponse = Deserialize(resp.data, InCartAccessTokenResponse)
    if (!r.refreshToken) {
      r.refreshToken = refreshToken
    }
    return r
  }

  public async logout(accessToken: string): Promise<boolean> {
    await this.axios.delete('/pcms/api/v1/auth/admin/access-token', {
      headers: {
        authorization: `${accessToken}`,
      }
    })
    return true
  }
}