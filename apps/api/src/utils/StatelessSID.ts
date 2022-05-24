
import { createDecipheriv, randomBytes, CipherGCM, createCipheriv, DecipherGCM, scryptSync } from 'crypto'

const gcmTagSize = 16
const nonceSize = 96/8

/**
 * Creating a Stateless SID.
 */
export class StatelessSID {

  private getDecipher: (iv: Buffer) => DecipherGCM
  private getCipher: (iv: Buffer) => CipherGCM

  constructor(protected readonly secret: string, public encryptedEncoding: BufferEncoding = 'base64') {
    // Key length is dependent on the algorithm. In this case for AES-128, it is
    // 16 bytes (128 bits).
    // Using IV as well.
    const key = scryptSync(secret, 'some-static-salt', 16)
    this.getDecipher = (iv: Buffer) => {
      return createDecipheriv('aes-128-gcm', key, iv)
    }
    this.getCipher = (iv: Buffer) => {
      return createCipheriv('aes-128-gcm', key, iv)
    }
  }

  decrypt(encrypted: string): string {
    const buffer = Buffer.from(encrypted, this.encryptedEncoding)
    const nonce = buffer.slice(0, nonceSize)
    const cipherText = buffer.slice(nonceSize, buffer.length - gcmTagSize)
    const tag = buffer.slice(buffer.length - gcmTagSize)
    const decipher = this.getDecipher(nonce)
    decipher.setAuthTag(tag)
    let out = decipher.update(cipherText, undefined, 'utf8')
    out += decipher.final('utf8')
    return out
  }

  encrypt(message: string): string {
    const nonce = randomBytes(nonceSize)
    const cipher = this.getCipher(nonce)
    const encrypted = Buffer.concat([
      nonce,
      cipher.update(message),
      cipher.final(),
      cipher.getAuthTag(),
    ])
    return encrypted.toString(this.encryptedEncoding)
  }

  /// Singleton

  static _instances: Record<string, StatelessSID> = {}

  /**
   * scryptSync is expensive, we should avoid calling this method repeatedly.
   * 
   * Use this method instead of creating a new stateless everytime it needs.
   * 
   * @param secret 
   */
  static reuse(secret: string): StatelessSID {
    const found = this._instances[secret]
    return found ?? (this._instances[secret] = new StatelessSID(secret))
  }
}