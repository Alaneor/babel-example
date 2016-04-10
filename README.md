# Example ES 2016 Project

> Example project that uses Babel to compile ES 2016 source code down to ES 2015, Node.js-compatible code.

## Description

This project serves as an example of what it would take to support modern JavaScript features in today's Node.js runtimes. The primary goal was to add async/await functions and modules support.

## Requirements

The following requirements have been set forth before the project started. Status of that requirement is denoted here, too.

- ✓ Can compile for Node.js 5.0 runtime
- ✓ Does not require Babel on production deployments
- ✓ Can be debugged with node-inspector
- ✓ Can be linted with ESLint
- ✓ Can be tested using Mocha, with tests being written using the new syntax
- ✓ Can generate class/function API documentation
- ⚠︎ Can generate test coverage reports

## Components used

- Compiler: [Babel](https://babeljs.io)
- Build tool: [GNU Make](https://www.gnu.org/software/make)
- Debugger: [Node-Inspector](https://github.com/node-inspector/node-inspector)
- Linter: [ESLint](http://eslint.org)
- Test runner: [Mocha](https://mochajs.org)
- Code coverage reporter: [nyc](https://github.com/bcoe/nyc)
- API docs generator: [ESDoc](https://esdoc.org)

## Approach

Frequently people use so-called on-the-fly compilers to transpile their source files down to compatible code. Examples include using `babel-node` as executable, requiring `babel-register` or similar. The problem with these is that the production target must have all the Babel-related modules installed and since compilation is done on-the-fly, it degrades performance significantly and consumes a lot of extra memory (because for each file, there are two distinct sources - original + compiled). Doing this also restricts usage of 3rd party libraries because the compiled code only exists in-memory and there is no mapping from the compiled source to the original.

The approach taken in this project was to treat the whole source code as if **compilation was a required step**, just like with C, Swift or other similar languages.

This allowed me to:

- Only include a single babel-related dependency on production systems (which only serves as a helper library and does not further modify code)
- Generate source maps so that source-map-aware tools can map the original source over the compiled source
- Dramatically reduce performance costs for execution

## Implementation

What follows is the implementation details on each individual part of the whole setup.

### Compiler

This was one of the easy parts - just install Babel, put all source code into *src/* folder and have it compiled into *out/* folder. Add *.babelrc* with all the transformation plugins that you want and off you go. The transpiled code relies on some helper utilities provided by the [`babel-runtime`](https://www.npmjs.com/package/babel-runtime) package. This package is needed especially for async functions. The package itself does not modify any code, it's just a runtime component needed for the execution.

The important part was to have Babel generate source maps as they are used by several other tools in this project.

> The weird thing is, that *.babelrc* does not support option to generate separate source map files even though the docs clearly mention this as being supported. So, instead of putting this into *.babelrc*, the `babel` executable itself must be run with `--source-maps` flag. Later on it was discovered that it is beneficial to have both source map files and inline source maps, so we actually use `--source-maps both` when compiling.

### Build tool

I decided to GNU Make because, well... I kinda like it and I already had lots of stuff set up via Make in other projects, so why not. This actually turned out to be quite a good choice, although Windows users will most likely hate me (like I care!).

I configured Make to look into the *src/* folder, find all the *.js* files and compile them with Babel into *out/* directory, preserving the directory structure, so that relative paths will keep working. The best thing is that Make only re-compiles files which have been modified since the last compilation - this further simplifies the workflow and saves time by not needing to recompile the whole project every time you touch a single file.

### Debugger

Node-Inspector supports source maps. We already have source maps available for all our sources, so there was nothing more to do.

Occasionally, it might be difficult to set up a breakpoint because the line numbers might not be properly matched to currently executing code. In that case, just put a `debugger` statement in your source instead.

### Linter

ESLint supports all ES 2015 syntax features, but not async/await functions. Fortunately, it does support alternative parsers. Using [`babel-eslint`](https://www.npmjs.com/package/babel-eslint) parser allowed me to get support for them, so linting works. Some built-in rules were flagging the async functions as not being written properly, so I disabled the rules and enabled their updated counterparts found in the [`eslint-plugin-babel`](https://www.npmjs.com/package/eslint-plugin-babel) package which provide support for async functions.

### Test runner

The tests are now compiled in *out/test*, so you can execute them with Node as-is. The only thing to fix was stack traces when a test fails - since we are executing the compiled code, the stack traces point to the compiled files and lines. This is not desirable - we want to see which actual code in our sources caused the error. Using [source-map-support](https://www.npmjs.com/package/source-map-support) package fixed the problem - the package is required by Mocha when the tests start and it patches the `Error` object's stack traces to point to the actual sources. It uses **inline source maps** in the compiled files to obtain that information.

> While not done in this project, it might be beneficial to use this package even on production systems, so that production errors can be easily tracked and debugged. The package is listed as a production dependency exactly for this reason.

### API documentation

ESDoc was a perfect fit for this project. It supports all the ES 2015 features and generates beautiful API docs for classes and their methods. Unfortunately again, async functions are not recognised by default, so I had to install a [plugin](https://www.npmjs.com/package/esdoc-es7-plugin) to ignore those. After that, everything was all good.

### Code coverage

This was probably the trickiest part. Istanbul does not support source maps, iSparta requires tests to be run with `babel-node`, jscoverage is old and obsolete...

After a while I found [`nyc`](https://github.com/bcoe/nyc) which looked promising - under the hood it uses Instanbul and adds support for source maps (+ some extra goodies which we do not care about too much). The reports sometimes look weird (docblocks being marked as not covered etc.) but it seems to get the job done, at least for some general overview.

The problem with `nyc` is that it fails miserably if a compiled file contains both inline source map and a reference to external source map file (and we need to have both!). So, as a currently only workaround, when code coverage reports need to be generated, **the project must be recompiled from scratch with Babel generating only external source maps**.

Another problem is that the generated report only includes files which were loaded during testing - it does not include "dead" files, ie. files which exist in the project but are not executed by any test. This could cause some weird results - you might see 100% code coverage, but in fact 90% of your code is not tested at all.

## Usage

Here are the commands you can use to actually do something useful with this project.

> **NOTE:**
> When you modify any of the source files, you must re-compile. That's the nature of compiled projects, so get used to it. Fortunately, Make will only re-compile files which have been modified since the last compilation, so it's not that terrible.

- **Install deps:**: `npm install`
- **Compile:** `make -j4`
  > The -j4 flag tells Make to compile at most 4 files at once. Adjust as you see fit.
- **Run tests:** `make test`
- **Lint code:**: `make lint`
- **Generate docs:**: `make clean docs`
- **Generate code coverage reports:** `make distclean && make -j4 coverage MAPS=true`
  > Once you are done with the reports, make sure you re-compile your project again so that the files contain both inline and external source maps in order for everything to work.
- **Clean up generated files:**: `make clean`
- **Clean up generated code:**: `make distclean`

## Final words

I was quite surprised to get this far, considering that async functions are quite new. Most of the stuff really works and only some issues remain.

While I would not recommend writing a library this way (mainly due to potential issues with troubleshooting errors - your users will not have `source-map-support` installed and the stack traces they will be sending you will all come from the compiled code, so troubleshooting might be really hard), it should be quite alright for projects where you are their sole user or which you fully operate - ie. a website or other similar application where, if something breaks, you have sufficient control over the environment to successfully troubleshoot the issue.

## License

This software it distributed under the MIT license. See [LICENSE](LICENSE) for more information.
