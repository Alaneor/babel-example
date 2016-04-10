// If someone requires this module as a dependency, expose the actual Fetcher class
// ES 2015 modules are compiled down to an object with `.default` key for `export default` objects,
// so this will get rid of that.
// NOTE: THIS FILE IS NOT COMPILED. Use only syntax supported natively on target platform.
module.exports = require('./out/lib/fetcher').default
