import { HelloController } from '../../../controllers'
import { prepareDependencies } from '../../utils/integral/di'

jest.setTimeout(30 * 1000)
describe('Hello controller', () => {

  beforeAll(prepareDependencies)

  const ctrl = new HelloController()

  it.each`
  length            | expected
  ${1}              | ${1}
  `('it can create new randomized string with correct length', async ({ length }) => {
    const created = await ctrl.init({
      body: {
        length,
      }
    } as any)
    expect(typeof created.output).toBe('string')
    expect(created.output.length).toEqual(length)
  })
})