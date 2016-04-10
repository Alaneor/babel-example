# Default target
all: out

include targets/nodejs/base.mk
include targets/nodejs/install.mk
include targets/nodejs/lint.mk

# Project-specific information
lintfiles = src
testflags = --opts src/test/mocha.opts out/test
maps = $(if ${MAPS},${MAPS},both)

# JS compilation targets
src = $(wildcard src/**/*.js)
out = $(src:src/%.js=out/%.js)
dirs = $(sort $(dir $(out)))

# Directory target for compiled code
out: $(dirs) $(out)

# Ensure directory for all compiled assets exists at all levels
$(dirs):
	mkdir -p $@

# Compile all js sources with Babel
out/%.js: src/%.js .babelrc node_modules
	$(bindir)babel --source-maps $(maps) --out-file $@ $<

# Run the tests! Also ensure that compiled assets are up to date
test: out
	$(bindir)mocha $(testflags)

# Generate coverage reports
coverage: out
	$(bindir)nyc --reporter=lcov --reporter=html --reporter=text $(bindir)mocha $(testflags)

# Generate code docs
docs: out
	$(bindir)esdoc -c .esdoc.json

# Delete docs
clean-docs:
	@rm -rf docs

# Delete coverage reports
clean-coverage:
	@rm -rf coverage .nyc_output

# Clean it all!
clean: clean-docs clean-coverage

# Clean really everything, even the compiled assets
distclean: clean
	@rm -rf out

# This file allows local Make target customisations without having to worry about them being
# accidentally commited to this file. local.mk is in gitignore.
-include local.mk
