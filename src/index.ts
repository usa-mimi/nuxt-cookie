import { CookiesStatic } from 'js-cookie'
import { ICookies } from 'cookies'

export { CookiesStatic } from 'js-cookie'
export { ICookies } from 'cookies'

type CookieEntity = CookiesStatic | ICookies

export type NuxtCookieOptions = {
  secure?: boolean
  domain?: string | undefined
  httpOnly?: boolean
  signed: boolean
}

export const nuxtCookieDefaultOptions = {
  secure: process.env.NODE_ENV === 'production',
  domain: undefined,
  httpOnly: false,
  signed: false,
}

export class NuxtCookie {
  _cookie!: CookieEntity
  _isServer!: boolean
  options!: NuxtCookieOptions

  constructor(
    { req, res, isServer }: { req: any; res: any; isServer: boolean },
    options: NuxtCookieOptions
  ) {
    if (isServer) {
      const Cookies = require('cookies')
      this._cookie = new Cookies(req, res, { secure: true })
    } else {
      this._cookie = require('js-cookie')
    }
    this._isServer = isServer
    this.options = Object.assign({}, nuxtCookieDefaultOptions, options || {})
  }

  get isServer() {
    return this._isServer
  }

  get isClinet() {
    return !this._isServer
  }

  mergeOptions(obj?: null | Record<string, any>) {
    if (!obj) return this.options
    return Object.assign(obj, this.options)
  }

  get(key: string) {
    let value = this._cookie.get(key, this.options)
    return value ? decodeURIComponent(value) : value
  }

  getJSON(key: string) {
    if (this.isClinet) {
      return (this._cookie as CookiesStatic).getJSON(key)
    } else {
      let s = this.get(key)
      if (typeof s !== 'string') return null
      let decoded = decodeURIComponent(s)
      try {
        return JSON.parse(decoded)
      } catch (_err) {
        console.error('Failed to cookie.getJSON', decoded)
        return null
      }
    }
  }

  set(key: string, value: any, option?: Record<string, any>) {
    if (value && typeof value === 'object') value = JSON.stringify(value)
    value = encodeURI(value)
    if (this.isClinet) {
      this._cookie.set(key, value, this.mergeOptions(option))
    } else {
      this._cookie.set(key, value, this.mergeOptions(option))
    }
  }

  remove(key: string) {
    if (this.isClinet) {
      ;(this._cookie as CookiesStatic).remove(key, this.options)
    } else {
      this._cookie.set(key, '', this.mergeOptions({ expires: new Date(0) }))
    }
  }
}
