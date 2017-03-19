JSFILES := $(shell find src/ -type f -name '*.js')

BUNDLE := dist/bundle.js
BUNDLE_MIN := dist/bundle.min.js

.PHONY: all depend clean

all: dist/bundle.js
remake: clean all

clean:
	rm -rf dist/bundle.js

depend:
	npm install

$(BUNDLE): $(JSFILES)
	rollup -c >dist/bundle.js_
	mv dist/bundle.js_ $(BUNDLE)

$(BUNDLE_MIN): $(BUNDLE)
	uglifyjs $(BUNDLE) >$(BUNDLE_MIN)
