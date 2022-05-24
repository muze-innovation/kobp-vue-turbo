import { probe } from "../../routes/healthcheck"

jest.setTimeout(25000)
describe('health check', () => {
  it('can probe for 3rd party services', async () => {
    const result = await probe()
    expect(result).toBeTruthy()
    expect(result.length).toEqual(2)
    expect(result[0]).toMatch(/^REDIS = OK/)
    expect(result[1]).toMatch(/^RDS = OK/)
  }, 25000)
})