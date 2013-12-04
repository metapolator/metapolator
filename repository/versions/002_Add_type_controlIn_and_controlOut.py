from sqlalchemy import *
from migrate import *

meta = MetaData()


type = Column('type', String(32))
control_in = Column('control_in', String(32))
control_out = Column('control_out', String(32))


def upgrade(migrate_engine):
    meta.bind = migrate_engine
    table = Table('glyphparam', meta, autoload=True)
    type.create(table)
    control_in.create(table)
    control_out.create(table)


def downgrade(migrate_engine):
    meta.bind = migrate_engine
