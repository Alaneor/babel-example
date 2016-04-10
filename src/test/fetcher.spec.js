import Fetcher from '../lib/fetcher'
import { expect } from 'chai'

describe('fetch', function() {
  it('should work', async function() {
    const fetcher = new Fetcher()
    const body = await fetcher.fetch('https://google.com')

    expect(body).to.be.a('string')
  })

  it('should fetch google by default', async function() {
    const fetcher = new Fetcher()
    const body = await fetcher.fetch()

    expect(body).to.be.a('string')
  })
})
