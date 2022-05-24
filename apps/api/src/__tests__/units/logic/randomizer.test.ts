import { Randomizer } from "../../../logic/randomizer"

describe('randomizer', () => {

  const rand = new Randomizer()

  it.each`
    length       | seed
    ${1}         | ${'<default>'}
    ${10}        | ${'<default>'}
    ${15}        | ${'1'}
    ${15}        | ${'12345'}
    ${12}        | ${'!12345'}
  `('can randomize basic string from $seed with length of $length', async ({ seed, length }) => {
    const actualSeed = (seed !== '<default>' || typeof seed === 'string') ? seed : undefined
    const out = rand.basic(length, actualSeed)
    expect(typeof out).toEqual('string')
    expect(out.length).toEqual(length)
    // Check if output is member of the seed.
    if (actualSeed) {
      const seedChars = actualSeed.split('')
      for(const char of out.split('')) {
        expect(seedChars.indexOf(char)).toBeGreaterThanOrEqual(0) // all character should be found within the seed.
      }
    }
  })
})