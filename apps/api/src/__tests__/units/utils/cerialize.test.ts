import { BirthDateSerializer } from "../../../utils/cerialize"

describe('cerialize', () => {
  
  it.each`
    birthDate                    | expected
    ${'1995-01-01'}              | ${'1995-01-01T00:00:00.000Z'}
    ${'1995-01-13'}              | ${'1995-01-13T00:00:00.000Z'}
    ${'1994-04-01T00:00:00.000Z'}| ${'1994-04-01T00:00:00.000Z'}
    ${'1994-15-12T00:00:00.000Z'}| ${null}
    ${'1995-13-01'}              | ${null}
    ${'abcde'}                   | ${null}
    ${undefined}                 | ${null}
    ${null}                      | ${null}
  `('can deserialize birthDate $birthDate to expected $expected', ({ birthDate, expected }) => {
    const result = BirthDateSerializer.Deserialize(birthDate)
    expect(result).toEqual(expected)
  })

  it.each`
    birthDate                    | expected
    ${'1995-01-01'}              | ${'1995-01-01'}
    ${'1994-04-01T00:00:00.000Z'}| ${'1994-04-01'}
    ${'1995-13-01'}              | ${null}
    ${'abcde'}                   | ${null}
    ${undefined}                 | ${null}
    ${null}                      | ${null}
  `('can Serialize birthDate $birthDate to expected $expected', ({ birthDate, expected }) => {
    const result = BirthDateSerializer.Serialize(birthDate)
    expect(result).toEqual(expected)
  })

})