all: setup

ifdef VENVRUN
else
VENVRUN=virtualenv
endif

venv/bin/activate:
	$(VENVRUN) .venv

install:
	easy_install -U distribute pip
	pip install virtualenv
	. .venv/bin/activate requirements.txt
	. .venv/bin/activate
	pip install -Ur requirements.txt
	npm install
	./node_modules/.bin/bower install
	./node_modules/.bin/gulp build

setup:
	mysql --user=root -e "CREATE DATABASE metapolatordev character set utf8 collate utf8_bin;"
	.venv/bin/python metapolator/models.py

clean:
	mv users/skel .
	rm -rf users/*
	mv skel users/
	mysql --user=root -e "DROP DATABASE metapolatordev;"

web: venv/bin/activate requirements.txt
	. .venv/bin/activate
	python run.py

celery: venv/bin/activate requirements.txt
	. .venv/bin/activate
	celery -A metapolator.tasks worker --loglevel=info

run: venv/bin/activate requirements.txt
	. .venv/bin/activate
	python run.py &
	open -a "Google Chrome" "http://localhost:8080" &
	chrome "http://localhost:8080" &
	. .venv/bin/activate; celery -A metapolator.tasks worker --loglevel=info
