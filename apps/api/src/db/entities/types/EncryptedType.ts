import { Platform, Type } from "@mikro-orm/core";

export class EncryptedType extends Type<string, string> {

  constructor(private readonly encryptionKey: string) {
    super()
  }

  convertToDatabaseValue(value: string, platform: Platform): string {
    if (!value) {
      return ''
    }
    return value
  }

  convertToJSValue(value: string, platform: Platform): string {
    if (!value) {
      return ''
    }
    return value
  }

  convertToJSValueSQL(key: string) {
    return `PGP_SYM_DECRYPT(${key}::bytea, '${this.encryptionKey}')`;
  }

  convertToDatabaseValueSQL(key: string) {
    return `PGP_SYM_ENCRYPT(${key}, '${this.encryptionKey}')`;
  }

  getColumnType(): string {
    return 'text';
  }
}