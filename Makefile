# python virtualenv preamble
ifdef VENVRUN
else
VENVRUN=virtualenv
endif

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

# run the web.py app
web:
	. .venv/bin/activate
	python run.py


# run the worker
support: 
	redis-server&
	. .venv/bin/activate && \
	celery -A metapolator.tasks worker 
run: 
	. .venv/bin/activate && \
	python run.py

all: install setup
