import { DateTime } from "luxon"

export const ISODateTimeSerializer = {
  // to JSON
  Serialize(raw: any): any {
    return raw instanceof Date ? raw.toISOString() : raw
  },
  // from JSON
  Deserialize(json: any): any {
    return new Date(json)
  }
}

export const BirthDateSerializer = {
  // to JSON
  Serialize(raw: any): any {
    if (!raw) return null
    return raw instanceof Date ? DateTime.fromJSDate(raw).toISODate() : DateTime.fromISO(raw).toISODate()
  },
  // from JSON
  Deserialize(json: any): any {
    return DateTime.fromISO(json, { zone: 'utc' }).toISO()
  }
}
