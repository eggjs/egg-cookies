/**
 * The namespace's name is the same as the exported EggCookies,
 * so you can solely use CookieGetOptions and CookieSetOptions
 * when you use
 * `import {CookieGetOptions, CookieSetOptions} from 'egg-cookies'`.
 */
declare namespace EggCookies {
  interface CookieGetOptions {
    /**
     * Whether to sign or not (The default value is true).
     */
    signed?: boolean;
    /**
     * Encrypt the cookie's value or not (The default value is false).
     */
    encrypt?: boolean;
  }

  interface CookieSetOptions {
    /**
     * The path for the cookie to be set in
     */
    path?: string;
    /**
     * The domain for the cookie
     */
    domain?: string;
    /**
     * Is overridable
     */
    overwrite?: boolean;
    /**
     * Is the same site
     */
    sameSite?: boolean | string;
    /**
     * Encrypt the cookie's value or not
     */
    encrypt?: boolean;
    /**
     * Max age for browsers
     */
    maxAge?: number;
    /**
     * Expire time
     */
    expires?: Date;
    /**
    * Is for http only
    */
    httpOnly?: boolean;
    /**
    * Encrypt the cookie's value or not
    */
    secure?: boolean;
    /**
     * Is it signed or not.
     */
    signed?: boolean;
  }

  class CookieError extends Error { }
}

declare class EggCookies {

  constructor(ctx?: any, keys?: any);

  /**
   * Get the Egg's cookies by name with optional options.
   * @param name The Egg's cookie's unique name.
   * @param opts Optional. The options for cookie's getting.
   * @returns The cookie's value according to the specific name.
   */
  get(name: string, opts?: EggCookies.CookieGetOptions): string;

  /**
   * Set the Egg's cookies by name with optional options.
   * @param name The Egg cookie's unique name.
   * @param value Optional. The Egg cookie's real value.
   * @param opts Optional. The options for cookie's setting.
   * @returns The current 'EggCookie' instance.
   */
  set(name: string, value?: string | null, opts?: EggCookies.CookieSetOptions): this;
}

export = EggCookies;
