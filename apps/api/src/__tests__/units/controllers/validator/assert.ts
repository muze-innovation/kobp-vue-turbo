import { assert } from "../../../../controllers/types/validator"

describe('assert', () => {
  const data = {
    largeIntegerPositiveString: "10000",
    largeIntegerPositiveInt: 10000,
    integerOneString: "1",
    integerOneInt: 1,
    integerMinusOneString: "-1",
    integerMinusOneInt: -1,
    integerZeroString: "0",
    integerZeroInt: 0,
    trueString: "true",
    falseString: "false",
    trueBoolean: true,
    falseBoolean: false,
    stringYes: "yes",
    stringNo: "no",
    exact134EnString: "123456789001234567890123456789ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ",
    exact134ThString: "แอร์เอเซียช็อตโปรเจ็กเตอร์เยน จูน เหมยอพาร์ทเมนต์ชินบัญชรไฮแจ็ค คีตกวีแซลมอน โจ๋ลิสต์โปรเจ็กเตอร์ เทปฮองเฮา จ๊อกกี้เมจิกสเตเดียมสไตรค์",
    zeroLeadMobileNumberString: '0869056962',
    plusSixSixMobileNumberString: '+66869056962',
  }

  describe('isBoolean', () => {
    it.each`
      valueKey                            | isValid
      ${'undefined-key'}                  | ${true}
      ${'largeIntegerPositiveString'}     | ${false}
      ${'largeIntegerPositiveInt'}        | ${false}
      ${'integerOneString'}               | ${true}
      ${'integerOneInt'}                  | ${true}
      ${'integerMinusOneString'}          | ${false}
      ${'integerMinusOneInt'}             | ${false}
      ${'integerZeroString'}              | ${true}
      ${'integerZeroInt'}                 | ${true}
      ${'trueString'}                     | ${true}
      ${'falseString'}                    | ${true}
      ${'trueBoolean'}                    | ${true}
      ${'falseBoolean'}                   | ${true}
      ${'stringYes'}                      | ${true}
      ${'stringNo'}                       | ${true}
      ${'exact134EnString'}               | ${false}
      ${'exact134ThString'}               | ${false}
      ${'zeroLeadMobileNumberString'}     | ${false}
      ${'plusSixSixMobileNumberString'}   | ${false}
    `('does not allow integer as boolean', ({ valueKey, isValid }) => {
      const r = expect(() => assert.isBoolean(data, valueKey))
      if (isValid) r.not.toThrow()
      else  r.toThrow()
    })
  })

  describe.each`
    pattern                 | shouldMatch
    ${/^(yes|no)$/i}        | ${['stringYes', 'stringNo']}
    ${/^(true|false)$/i}    | ${['trueString', 'falseString', 'trueBoolean', 'falseBoolean']}
    ${/^(0\d{5,})$/i}       | ${['zeroLeadMobileNumberString']}
  `('matched($pattern) would match only $shouldMatch', ({ pattern, shouldMatch }) => {
    it.each`
      valueKey                            | isString      | neverThrow
      ${'undefined-key'}                  | ${false}      | ${true}
      ${'largeIntegerPositiveString'}     | ${true}       | ${false}
      ${'largeIntegerPositiveInt'}        | ${false}      | ${false}
      ${'integerOneString'}               | ${true}       | ${false}
      ${'integerOneInt'}                  | ${false}      | ${false}
      ${'integerMinusOneString'}          | ${true}       | ${false}
      ${'integerMinusOneInt'}             | ${false}      | ${false}
      ${'integerZeroString'}              | ${true}       | ${false}
      ${'integerZeroInt'}                 | ${false}      | ${false}
      ${'trueString'}                     | ${true}       | ${false}
      ${'falseString'}                    | ${true}       | ${false}
      ${'trueBoolean'}                    | ${true}       | ${false}
      ${'falseBoolean'}                   | ${true}       | ${false}
      ${'stringYes'}                      | ${true}       | ${false}
      ${'stringNo'}                       | ${true}       | ${false}
      ${'exact134EnString'}               | ${true}       | ${false}
      ${'exact134ThString'}               | ${true}       | ${false}
      ${'zeroLeadMobileNumberString'}     | ${true}       | ${false}
      ${'plusSixSixMobileNumberString'}   | ${true}       | ${false}
    `('against $valueKey', ({ valueKey, isString, neverThrow }) => {
      const r = expect(() => assert.matched(data, valueKey, pattern))
      if (neverThrow || (isString && shouldMatch.indexOf(valueKey) >= 0))
        r.not.toThrow()
      else r.toThrow()
    })
  })
})