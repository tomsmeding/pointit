JSFILES := $(shell find src/ -type f -name '*.js')

.PHONY: all depend clean

all: dist/bundle.js

clean:
	rm -rf bundle.js

depend:
	npm install

dist/bundle.js: $(JSFILES)
	rollup -c >dist/bundle.js_
	mv dist/bundle.js_ dist/bundle.js
