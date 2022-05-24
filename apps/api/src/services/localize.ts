import { Lang } from 'kobp'
import get from 'lodash/get'
import reduce from 'lodash/reduce'

export type SupportLang = 'th' | 'en'

export const text = (code: string, replacements: { [key: string]: string } = {}, langKey: string | undefined = undefined): string => {
  return LocalizeService.shared().text(code, replacements, langKey)
}

export class LocalizeService {

  private static _instnace: LocalizeService | undefined

  static shared(): LocalizeService {
    return LocalizeService._instnace || (LocalizeService._instnace = new LocalizeService())
  }

  private _langs: { [key in SupportLang]: string }

  private constructor() {
    this._langs = {
      en: require('../../assets/lang/en.json'),
      th: require('../../assets/lang/th.json'),
    }
  }

  public text(key: string, replacements: { [key: string]: string } = {}, _langKey: string | undefined = undefined): string {
    const langKey = _langKey || Lang.current('en')
    const message: string = get(this._langs, [langKey, key], '')
    return reduce(replacements, (prev, value, k) => {
      return prev.replace(new RegExp(`(\{\{${k}\}\})`, 'g'), value)
    }, message)
  }
}