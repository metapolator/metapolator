import models
import re
import xmltomf

import os
import web
from cStringIO import StringIO
from sqlalchemy.orm import scoped_session, sessionmaker
from config import session, engine, working_dir


session.user = 1
session.authorized = True

web.ctx.orm = scoped_session(sessionmaker(bind=engine))

master = models.Master.get(fontname='MP_Akku-angle')
glyph = models.Glyph.get(master_id=master.id, name='71', fontsource='A')
glyphB = models.Glyph.get(master_id=master.id, name='71', fontsource='B')

result = xmltomf.xmltomf1(master, glyph, glyphB, stdout_fip=StringIO())
result.seek(0)
print result.read()

import sys
sys.exit(0)
