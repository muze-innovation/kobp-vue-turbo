import {
  parsePhoneNumberWithError,
  ParseError,
  CountryCode,
} from 'libphonenumber-js/mobile'

const DEFAULT_COUNTRY = 'TH'

export interface ParseOption {
  allowInvalid: boolean
  defaultCountry: CountryCode // default country code if +<dialCode> is missing.
}

export class SimpleMSISDNError extends Error {

  constructor(public input: string, public reasonCode: string, public reasonMessage: string) {
    super(`E_${reasonCode} ${input} ${reasonMessage}`)
  }

  public static cannotBeParsed(input: string): SimpleMSISDNError {
    return new SimpleMSISDNError(input, '40001', 'Cannot be parsed.')
  }

  public static extensionIsNotSupported(input: string): SimpleMSISDNError {
    return new SimpleMSISDNError(input, '40002', 'Extension is not supported.')
  }

  public static invalidType(input: string, type: string): SimpleMSISDNError {
    return new SimpleMSISDNError(input, '40003', `type '${type}' is invalid.`)
  }

  public static tooLong(input: string): SimpleMSISDNError {
    return new SimpleMSISDNError(input, '40004', 'Too long.')
  }

  public static tooShort(input: string): SimpleMSISDNError {
    return new SimpleMSISDNError(input, '40004', 'Too short.')
  }

  public static cannotIdentifyCountry(input: string): SimpleMSISDNError {
    return new SimpleMSISDNError(input, '40005', 'Cannot identify country.')
  }

  public static notANumber(input: string): SimpleMSISDNError {
    return new SimpleMSISDNError(input, '40006', 'Not a number.')
  }

  public static otherReason(input: string, otherResaon?: string | Error): SimpleMSISDNError {
    const reason = otherResaon?.toString() || 'unknown reason'
    return new SimpleMSISDNError(input, '40099', `Cannot be parsed because ${reason}.`)
  }
}

export class SimpleMSISDN {

  /**
   * Dialling Code
   */
  public readonly dc: string

  /**
   * Country Code with format of ISO-3166-1 Alpha 2
   * 
   * 2 alphabetical characters for Country Code
   */
  public readonly cc: string

  /**
   * The localized representation
   * 
   * For +6686905696
   * it should returns `0869056962`
   */
  public readonly cleanNationalNumber: string // Localized format used in the country.

  /**
   * e164 format.
   */
  public readonly e164: string

  /**
   * Non empty string if the MSISDN is disabled.
   */
  public readonly disableFlag: string

  /**
   * If undefined, means this object is valid.
   */
  invalidReason: SimpleMSISDNError | null = null

  public constructor(dc: string, cc: string, e164: string, cleanNationalNumber: string, disableFlag: string, invalidReason: SimpleMSISDNError | null = null) {
    this.dc = dc
    this.cc = cc
    this.e164 = e164
    this.cleanNationalNumber = cleanNationalNumber
    this.invalidReason = invalidReason
    this.disableFlag = disableFlag
  }

  public toJson(): string {
    return this.toString()
  }

  public toString(): string {
    if (this.disableFlag) {
      return `${this.e164}#${this.disableFlag}`
    }
    return this.e164
  }

  public get isDisabled(): boolean {
    return this.disableFlag !== ''
  }

  public get isInvalid(): boolean {
    return this.invalidReason !== null
  }

  /**
   * Supported format
   * 
   * Old version
   * 
   *  `0869056962` => `dc: 66, e164: +66869056962, cc: 'TH'`
   *  `+66869056962` => `dc: 66, e164: +66869056962, cc 'TH'`
   * 
   * New version
   *  `+66869056962` => `dc: 66, e164: +66869056962, cc: 'TH'`
   *  `+919825098250` => `dc: 91, e164: +919825098250, cc: 'IN'`
   * 
   * @param spwAnnotatedNumber can be e164 format, or local format (default to TH))
   */
  public static parse(spwAnnotatedNumber: string, _opts: Partial<ParseOption>): SimpleMSISDN {
    // Creating a MSISDN object
    const opts: ParseOption = {
      defaultCountry: DEFAULT_COUNTRY,
      allowInvalid: false,
      ..._opts,
    }
    let raw = spwAnnotatedNumber.replace(/[,\)\(\- ]/g, '')
    const disableMatches = raw.match(/#([0-9A-Z]+)$/)
    let disableFlag = ''
    if (disableMatches) {
      disableFlag = disableMatches[1]
      raw = raw.replace(/#[0-9A-Z]+$/, '')
    }
    try {
      const parsed = parsePhoneNumberWithError(raw, opts.defaultCountry)
      const err = (): SimpleMSISDNError | null => {
        if (!parsed) {
          return SimpleMSISDNError.cannotBeParsed(spwAnnotatedNumber)
        }
        if (parsed.ext) {
          return SimpleMSISDNError.extensionIsNotSupported(spwAnnotatedNumber)
        }
        const type = parsed.getType()
        if (type && type !== 'MOBILE') {
          return SimpleMSISDNError.invalidType(spwAnnotatedNumber, type)
        }
        if (!parsed.country) {
          return SimpleMSISDNError.cannotIdentifyCountry(spwAnnotatedNumber)
        }
        if (raw.length < 7) {
          return SimpleMSISDNError.tooShort(spwAnnotatedNumber)
        }
        return null
      }
      const error = err()
      if (!opts.allowInvalid && error) {
        throw error
      }
      return new SimpleMSISDN(
        parsed.countryCallingCode,
        parsed.country || opts.defaultCountry,
        parsed.format('E.164'),
        parsed.format('NATIONAL').replace(/[\(\) \-\.]/g, ''),
        disableFlag,
        error,
      )
    } catch (_e) {
      const err = (e: any): SimpleMSISDNError => {
        if (e instanceof ParseError) {
          // Possible Error: https://github.com/catamphetamine/libphonenumber-js#possible-errors
          if (e.message === 'TOO_SHORT') {
            return SimpleMSISDNError.tooShort(spwAnnotatedNumber)
          }
          if (e.message === 'TOO_LONG') { // National Part is longer than 17 characters.
            return SimpleMSISDNError.tooLong(spwAnnotatedNumber)
          }
          if (e.message === 'NOT_A_NUMBER') {
            return SimpleMSISDNError.notANumber(spwAnnotatedNumber)
          }
          if (e.message === 'INVALID_COUNTRY') {
            return SimpleMSISDNError.cannotIdentifyCountry(spwAnnotatedNumber)
          }
        }
        if (e instanceof SimpleMSISDNError) {
          return e
        }
        return SimpleMSISDNError.otherReason(spwAnnotatedNumber, e)
      }
      if (!opts.allowInvalid) {
        throw err(_e)
      }
      return new SimpleMSISDN(
        '',
        opts.defaultCountry,
        raw,
        raw.replace(/[\(\) \-\.]/g, ''),
        disableFlag,
        err(_e),
      )
    }
  }
}