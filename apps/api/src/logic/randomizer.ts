const _strLength = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export interface IRandomizer {

  /**
   * Generate a random string with specific length
   * 
   * @param length 
   * @returns a randommly generated string
   */
  basic(length: number): string
}

export class Randomizer {

  public basic(length: number, seedString: string = _strLength) {
    let randomizedContent = ''
    for (let index = 0; index < length; index++) {
      randomizedContent = randomizedContent + seedString[Math.floor(Math.random() * seedString.length)]
    }
    return randomizedContent
  }
}