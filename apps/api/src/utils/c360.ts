import Fraction from "fraction.js"
import { Loggy } from "kobp"
import { DateTime } from "luxon"
import { Balance, C360InvestorProfileInfo, MvpInverstorProfile, PointInfo, TierObject } from "../services/models/OnBoarding"

export const DATE_POINT_FORMAT = 'M/d/yyyy'

export const helpers = {
  getTierObj: (tierId: string = '7'): TierObject => {
    const TIER_LIST: Record<string, TierObject> = {
      '7': { name: { en: 'VIZ White', th: 'VIZ White' } },
      '8': { name: { en: 'VIZ Titanium', th: 'VIZ Titanium' } },
      '9': { name: { en: 'VIZ Black', th: 'VIZ Black' } },
    }
    return TIER_LIST[tierId]
  },

  getPointBalance: (current: number = 0, rate: string | number): Balance => {
    return {
      points: current,
      coins: new Fraction(current).mul(new Fraction(rate)).ceil(0).valueOf(),
      convertRate: rate,
    }
  },
  
  getInvestorInfo: (investorInfo?: C360InvestorProfileInfo): MvpInverstorProfile | undefined => {
    if (!investorInfo) return undefined
    return {
      ...investorInfo,
      parValue: 1
    }
  },

  resolvePointConversionRate: (pointInfo?: PointInfo[]): string | number => {
    // TOTEST: add test case for search date
    try {
      if (pointInfo) {
        const pointDetail = (pointInfo || []).find((info) => {
          const { startDate, endDate } = info
          //5/11/2021
          const st = DateTime.fromFormat(startDate, DATE_POINT_FORMAT).startOf('day')
          const ed = DateTime.fromFormat(endDate, DATE_POINT_FORMAT).endOf('day')
          const now = DateTime.now()
          return now >= st && now <= ed
        })
        if (pointDetail) {
          const { point, coin } = pointDetail
          return `${coin}:${point}`
        } 
      }
    } catch (e: any) {
      // handle reolve point fail
      Loggy.error('cannot resolve point info', e)
      Loggy.log('pointInfo', pointInfo)
    }
    return process.env.POINT_CONVERSION_RATE || '110:1000'
  }
}