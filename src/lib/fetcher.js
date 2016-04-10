import request from 'request'

/**
 * This is the Fetcher class. It fetches.
 */
export default class Fetcher {

  /**
   * Fetch a URL
   *
   * @param     {String}            url    URL to be fetched
   * @return    {Promise<String>}
   */
  fetch(url = 'https://google.com') {
    return new Promise((resolve, reject) => {
      request.get(url, (err, res, body) => err ? reject(err) : resolve(body))
    })
  }

  /**
   * Read the contents at given URL as JSON
   *
   * @param     {String}            url     URL to be read
   * @return    {?Promise<Object>}
   */
  async json(url) {
    try {
      const body = await this.fetch(url)

      return JSON.parse(body)
    } catch (err) {
      // TODO: Maybe don't swallow the error...?
      return null
    }
  }
}
