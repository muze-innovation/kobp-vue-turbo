import { Platform, Type } from "@mikro-orm/core";
import { createHmac } from "crypto";

export class HashedType extends Type<string, string> {

  constructor(private readonly hashKey: string) {
    super()
  }

  convertToDatabaseValue(value: string, platform: Platform): string {
    if (!value) {
      return ''
    }
    return createHmac('sha256', this.hashKey).update(value).digest("hex");
  }

  convertToJSValue(value: string, platform: Platform): string {
    if (!value) {
      return ''
    }
    return value
  }

  convertToJSValueSQL(key: string) {
    return key
  }

  convertToDatabaseValueSQL(key: string) {
    return `encode(hmac(${key}, '${this.hashKey}', 'sha256'), 'hex')`;
  }

  getColumnType(): string {
    return 'text';
  }
}