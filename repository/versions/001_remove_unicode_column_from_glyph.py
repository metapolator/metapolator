from sqlalchemy import *
from migrate import *


meta = MetaData()


unicode = Column('unicode', String(32))


def upgrade(migrate_engine):
    meta.bind = migrate_engine
    table = Table('glyph', meta, autoload=True)
    table.c.unicode.drop()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pass
