#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

.PHONY: all venv prepare-dev install install-js install-local-reforis watch-js build-js lint lint-js lint-js-fix lint-web test test-js test-web test-js-update-snapshots create-messages init-langs update-messages compile-messages clean

DEV_PYTHON=python3.7
ROUTER_PYTHON=python3.6
VENV_NAME?=venv
VENV_BIN=$(shell pwd)/$(VENV_NAME)/bin

JS_DIR=./js

LANGS = cs da de el en fi fo fr hr hu it ja ko lt nb nb_NO nl pl ro ru sk sv

all:
	@echo "make prepare-env"
	@echo "    Install tools for development environment: node, npm, Python, virtualenv"
	@echo "make prepare-dev"
	@echo "    Create python virtual environment and install dependencies."
	@echo "make install"
	@echo "    Install package in your system (for running on router)."
	@echo "make watch-js"
	@echo "    Compile JS in watch mode."
	@echo "make build-js"
	@echo "    Compile JS."
	@echo "make lint"
	@echo "    Run lint on project."
	@echo "make test"
	@echo "    Run tests on project."
	@echo "make create-messages"
	@echo "    Create locale messages (.pot)."
	@echo "make update-messages"
	@echo "    Update locale messages from .pot file."
	@echo "make compile-messages"
	@echo "    Compile locale messager."
	@echo "make clean"
	@echo "    Remove python artifacts and virtualenv."

venv: $(VENV_NAME)/bin/activate
$(VENV_NAME)/bin/activate: setup.py
	test -d $(VENV_NAME) || $(DEV_PYTHON) -m virtualenv -p $(DEV_PYTHON) $(VENV_NAME)
	# Some problem in latest version of setuptools during extracting translations.
	$(VENV_BIN)/$(DEV_PYTHON) -m pip install -U pip setuptools==39.1.0
	$(VENV_BIN)/$(DEV_PYTHON) -m pip install -e .[devel]
	touch $(VENV_NAME)/bin/activate

prepare-env:
	which npm || curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
	which npm || sudo apt install -y nodejs
	which $(DEV_PYTHON) || sudo apt install -y $(DEV_PYTHON) $(DEV_PYTHON)-pip
	which virtualenv || sudo $(DEV_PYTHON) -m pip install virtualenv
prepare-dev:
	cd $(JS_DIR); npm install
	make venv

install:
	$(ROUTER_PYTHON) -m pip install -e .
	ln -sf /tmp/reforis-remote-devices/reforis_static/reforis_remote_devices /tmp/reforis/reforis_static/
	/etc/init.d/lighttpd restart
install-js: js/package.json
	cd $(JS_DIR); npm install --save-dev
install-local-reforis:
	$(VENV_BIN)/$(DEV_PYTHON) -m pip install -e ../reforis

watch-js:
	cd $(JS_DIR); npm run-script watch
build-js:
	cd $(JS_DIR); npm run-script build

lint: lint-js lint-web
lint-js:
	cd $(JS_DIR); npm run lint
lint-js-fix:
	cd $(JS_DIR); npm run lint:fix
lint-web: venv
	$(VENV_BIN)/$(DEV_PYTHON) -m pylint --rcfile=pylintrc reforis_remote_devices
	$(VENV_BIN)/$(DEV_PYTHON) -m pycodestyle --config=pycodestyle reforis_remote_devices

test: test-js test-web
test-js:
	cd $(JS_DIR); npm test
test-web: venv
	$(VENV_BIN)/$(DEV_PYTHON) -m pytest -vv tests
test-js-update-snapshots:
	cd $(JS_DIR); npm test -- -u

create-messages:
	$(VENV_BIN)/pybabel extract -F babel.cfg -o ./reforis_remote_devices/translations/messages.pot .
init-langs: create-messages
	for lang in $(LANGS); do \
		$(VENV_BIN)/pybabel init \
		-i reforis_remote_devices/translations/messages.pot \
		-d reforis_remote_devices/translations/ -l $$lang \
	; done
update-messages:
	$(VENV_BIN)/pybabel update -i ./reforis_remote_devices/translations/messages.pot -d ./reforis_remote_devices/translations
compile-messages:
	$(VENV_BIN)/pybabel compile -f -d ./reforis_remote_devices/translations

clean:
	find . -name '*.pyc' -exec rm -f {} +
	rm -rf $(VENV_NAME) *.eggs *.egg-info dist build .cache
	rm -rf dist build *.egg-info
	rm -rf $(JS_DIR)/node_modules/ reforis_static/remote_devices/app.min.js
	$(ROUTER_PYTHON) -m pip uninstall -y reforis_remote_devices
