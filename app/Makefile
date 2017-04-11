JSFILES := $(shell find src/ -type f -name '*.js')

CLIENT_BUNDLE := dist/client.js
CLIENT_BUNDLE_MIN := dist/client.min.js

SPEC_BUNDLE := dist/spec.js
SPEC_BUNDLE_MIN := dist/spec.min.js

.PHONY: all remake depend clean client client-min spec spec-min both min

all: both

remake: clean
	$(MAKE) all

clean:
	rm -f dist/{client,spec}{.min,}.js{.map,}

depend:
	npm install

# === Platform targets

client: $(CLIENT_BUNDLE)
client-min: $(CLIENT_BUNDLE_MIN)
spec: $(SPEC_BUNDLE)
spec-min: $(SPEC_BUNDLE_MIN)

# === Combined targets

both: client spec
min: client-min spec-min

# === Real targets

$(CLIENT_BUNDLE): $(JSFILES)
	rollup -c ./rollup.client.config.js -o $@
$(CLIENT_BUNDLE_MIN): $(CLIENT_BUNDLE)
	uglifyjs $? >$@

$(SPEC_BUNDLE): $(JSFILES)
	rollup -c ./rollup.spec.config.js -o $@
$(SPEC_BUNDLE_MIN): $(SPEC_BUNDLE)
	uglifyjs $? >$@
