import { SVClient } from "../utils/e2e/client"

jest.setTimeout(30 * 1000)
describe('profile controller', () => {
  // Begin test cases
  const serviceEndpoint = (process.env.SV_ENDPOINT || 'http://localhost:8000/core') /* for running test on Server */
  const targetProfileId = '123456'
  const client = new SVClient({
    host: serviceEndpoint,
  })

  beforeAll(async (done) => {
    // Delete profile
    await client.deleteProfile(targetProfileId)
    done()
  })

  it('can create a new profile', async () => {
    const resp0 = await client.createProfile(targetProfileId, 'tester')
    expect(resp0.data.profileId).toBeTruthy()
    expect(resp0.data.profileId).toEqual(targetProfileId)
    expect(resp0.data.name).toEqual('tester')
  })


  it('can create be updated', async () => {
    const resp0 = await client.updateProfile(targetProfileId, 'tester-updated')
    expect(resp0.data.profileId).toBeTruthy()
    expect(resp0.data.profileId).toEqual(targetProfileId)
    expect(resp0.data.name).toEqual('tester-updated')
  })

  it('can be fetched', async () => {
    const resp0 = await client.getProfile(targetProfileId)
    expect(resp0.data.profileId).toBeTruthy()
    expect(resp0.data.profileId).toEqual(targetProfileId)
    expect(resp0.data.name).toEqual('tester-updated')
  })

  it('can be deleted', async () => {
    const resp0 = await client.deleteProfile(targetProfileId)
    expect(resp0.data).toBeTruthy()
  })
})