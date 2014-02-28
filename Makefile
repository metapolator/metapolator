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
	. .venv/bin/activate; pip install -Ur requirements.txt

setup:
	mysql --user=root -e "CREATE DATABASE metapolatordev;";
	.venv/bin/python metapolator/models.py;

clean:
	mv users/skel .
	rm -rf users/*
	mv skel users/
	mysql --user=root -e "DROP DATABASE metapolatordev;";

web: venv/bin/activate requirements.txt
	. .venv/bin/activate; python run.py

celery: venv/bin/activate requirements.txt
	. .venv/bin/activate; celery -A metapolator.tasks worker --loglevel=info
