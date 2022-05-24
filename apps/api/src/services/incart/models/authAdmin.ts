import { autoserializeAs } from 'cerialize'

export class InCartAccessTokenResponse {
  @autoserializeAs('accessToken')
  accessToken!: string

  @autoserializeAs('refreshToken')
  refreshToken!: string
}