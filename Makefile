all: setup


ifdef VENVRUN
else
VENVRUN=virtualenv
endif


venv/bin/activate:
	$(VENVRUN) .venv

setup: venv/bin/activate requirements.txt
	. .venv/bin/activate; pip install -Ur requirements.txt

run: venv/bin/activate requirements.txt
	. .venv/bin/activate; python run.py

celery: venv/bin/activate requirements.txt
	. .venv/bin/activate; celery -A metapolator.tasks worker --loglevel=info
