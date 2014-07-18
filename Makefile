# python virtualenv preamble
ifdef VENVRUN
else
VENVRUN=virtualenv
endif

build:
	@echo "${HR}"
	@echo "Building UP assets..."
	@echo "${HR}"
	@recess --compress _assets/up.less > css/up.css
	@echo "Compiling and Compressing Less and CSS files with Recess... ${CHECK} Done"
	@cat _assets/bootstrapjs/* > js/up.js.tmp
	@cat _assets/up.js >> js/up.js.tmp
	@uglifyjs -nc  js/up.js.tmp > js/up.js
	@rm -rf js/up.js.tmp
	@echo "Compiling and Compressing JS files with uglify-js... ${CHECK} Done"
	@echo "${HR}"
	@echo "UP successfully built."
	@echo "${HR}"
	@echo "<3 @caarlos0"
venv:
	$(VENVRUN) .venv --no-site-packages

# install dependencies
install:
	pip install virtualenv
	$(VENVRUN) .venv --no-site-packages
	. .venv/bin/activate && \
	pip install -Ur requirements.txt
	npm install
	./node_modules/.bin/gulp build
	echo "Now do: make setup"

# create database. TODO: decide if we need this - why not put it in install?
setup:
	mysql --user=root -e "CREATE DATABASE metapolatordev character set utf8 collate utf8_bin;"
	.venv/bin/python metapolator/models.py
	echo "Now do: make run"

# delete all user data
clean:
	mv users/skel .
	rm -rf users/*
	mv skel users/
	mysql --user=root -e "DROP DATABASE metapolatordev;"

# run the worker
support: 
	redis-server&
	. .venv/bin/activate && \
	celery -A metapolator.tasks worker 
run: 
	. .venv/bin/activate && \
	python run.py

all: install setup
