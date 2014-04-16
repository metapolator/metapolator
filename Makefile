# python virtualenv preamble
ifdef VENVRUN
else
VENVRUN=virtualenv
endif

venv/bin/activate:
	$(VENVRUN) .venv

# install dependencies
install:
	easy_install -U distribute pip
	pip install virtualenv
	. .venv/bin/activate requirements.txt
	. .venv/bin/activate
	pip install -Ur requirements.txt
	npm install
	./node_modules/.bin/bower install
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

# run the web.py app
web: venv/bin/activate requirements.txt
	. .venv/bin/activate
	python run.py

# run the worker
celery: venv/bin/activate requirements.txt
	. .venv/bin/activate
	celery -A metapolator.tasks worker --loglevel=info

# run the system, open Chrome 
run: venv/bin/activate requirements.txt
	. .venv/bin/activate
	python run.py &
	open -a "Google Chrome" "http://localhost:8080" &
	chromium-browser "http://localhost:8080" &
	celery -A metapolator.tasks worker --loglevel=info

all: install setup
