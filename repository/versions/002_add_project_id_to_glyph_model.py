from sqlalchemy import *
from migrate import *


meta = MetaData()


projects = Table('projects', meta, Column('id', Integer))


project_id = Column('project_id', Integer, ForeignKey('projects.id'))


def upgrade(migrate_engine):
    meta.bind = migrate_engine
    table = Table('glyph', meta, autoload=True)
    project_id.create(table)


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pass
