from sqlalchemy import *
from migrate import *


meta = MetaData()


def upgrade(migrate_engine):
    meta.bind = migrate_engine

    table = Table('glyphparam', meta, autoload=True)

    table.c.doubledash.alter(type=String(32))
    table.c.tripledash.alter(type=String(32))
    table.c.superleft.alter(type=String(32))
    table.c.superright.alter(type=String(32))
    table.c.leftp.alter(type=String(32))
    table.c.rightp.alter(type=String(32))
    table.c.downp.alter(type=String(32))
    table.c.upp.alter(type=String(32))
    table.c.leftp2.alter(type=String(32))
    table.c.rightp2.alter(type=String(32))
    table.c.downp2.alter(type=String(32))
    table.c.upp2.alter(type=String(32))
    table.c.cycle.alter(type=String(32))
    table.c.ascpoint.alter(type=String(32))
    table.c.descpoint.alter(type=String(32))
    table.c.inktrap_l.alter(type=String(32))
    table.c.inktrap_r.alter(type=String(32))


def downgrade(migrate_engine):
    meta.bind = migrate_engine
