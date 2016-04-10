// @TODO: The coverage reporter ignores this file because we do not load it anywhere. There's a flag
// to include all sources in the coverage report, but it breaks spectacularly when it encounters
// async functions.

import Fetcher from './fetcher'

const fetcher = new Fetcher()

void (async () => {
  const res = await fetcher.read('https://google.com')

  // eslint-disable-next-line no-console
  console.log(typeof res)
})()
