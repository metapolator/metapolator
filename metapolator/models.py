import datetime
import os
import os.path as op
import web

from sqlalchemy import Column, Integer, String, Text, Enum, Float, \
    Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.orm.exc import NoResultFound

from config import engine, working_dir
from dbapi import UserQueryMixin, query

Base = declarative_base()


class User(Base):

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(32), index=True)
    password = Column(Text)
    email = Column(String(32))
    is_admin = Column(Boolean)
    date_joined = Column(DateTime)

    @classmethod
    def create(cls, username, password, email):
        from passlib.hash import bcrypt
        user = User()
        user.password = bcrypt.encrypt(password)
        user.username = username
        user.email = email
        user.date_joined = datetime.datetime.now()
        web.ctx.orm.add(user)
        web.ctx.orm.commit()
        return user

    @classmethod
    def get(cls, **kwargs):
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None


class LocalParam(Base, UserQueryMixin):

    __tablename__ = 'localparam'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))

    px = Column(Float, default=0)
    width = Column(Float, default=1)
    space = Column(Float, default=0)
    xheight = Column(Float, default=5)
    capital = Column(Float, default=8)
    boxheight = Column(Float, default=10)
    ascender = Column(Float, default=8)
    descender = Column(Float, default=2)
    inktrap = Column(Float, default=10)
    stemcut = Column(Float, default=20)
    skeleton = Column(Float, default=0)
    superness = Column(Float, default=1)
    over = Column(Float, default=0.1)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class GlobalParam(Base, UserQueryMixin):

    __tablename__ = 'globalparam'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))

    metapolation = Column(Float, default=0)
    unitwidth = Column(Float, default=0)
    fontsize = Column(Float, default=10)
    mean = Column(Float, default=5, doc='height of lower case')
    cap = Column(Float, default=8, doc='height of uppercase')
    ascl = Column(Float, default=2, doc='highest height of talles character')
    des = Column(Float, default=2, doc='lowest point in glyphs')
    box = Column(Float, default=10)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Project(Base, UserQueryMixin):

    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))

    projectname = Column(String(128), index=True)

    @classmethod
    def get_master(cls, projectname, version=False):
        project = Project.get(projectname=projectname)
        if not project:
            return

        master = Master.filter(project_id=project.id)
        if version:
            master = master.filter_by(version=version)
        return master.order_by(Master.version.desc()).one()

    def get_directory(self):
        directory = op.join(working_dir(), self.projectname)
        if not op.exists(directory):
            os.makedirs(directory)
        return directory


class Master(Base, UserQueryMixin):

    __tablename__ = 'master'

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('projects.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    idlocala = Column(Integer, ForeignKey('localparam.id'))
    idlocalb = Column(Integer, ForeignKey('localparam.id'))
    idglobal = Column(Integer, ForeignKey('globalparam.id'))
    version = Column(Integer, default=0, index=True)

    fontnamea = Column(Text)
    fontnameb = Column(Text)

    project = relationship('Project', backref='projects')

    def get_glyphs(self, ab_source='A'):
        q = Glyph.filter(master_id=self.id, fontsource=ab_source.upper())
        return q.order_by(Glyph.name.asc())

    def get_ufo_path(self, ab_source):
        fontpath = self.get_fonts_directory()
        ab_source = ab_source.upper()
        return op.join(fontpath, '%s%s.%03d.UFO' % (self.project.projectname,
                                                    ab_source,
                                                    self.version))

    def get_fonts_directory(self, ab_source=None):
        """
        Return uploaded user font project directory.

        If ab_source set then return FontA or FontB directories in fonts
        project directory. If FontB is not set then it returns FontA.
        """
        fonts_directory = op.join(self.project.get_directory())
        if not ab_source:
            return fonts_directory
        if ab_source.lower() == 'a':
            return op.join(fonts_directory, self.fontnamea)
        elif ab_source.lower() == 'b' and self.fontnameb:
            return op.join(fonts_directory, self.fontnameb)
        return op.join(fonts_directory, self.fontnamea)


class Glyph(Base, UserQueryMixin):

    __tablename__ = 'glyph'

    id = Column(Integer, primary_key=True)
    master_id = Column(Integer, ForeignKey('master.id'))
    user_id = Column(Integer, ForeignKey('users.id'))

    fontsource = Column(Enum('A', 'B'), index=True)
    name = Column(String(3), index=True)
    width = Column(Integer)
    unicode = Column(Text)


class GlyphOutline(Base, UserQueryMixin):

    __tablename__ = 'glyphoutline'

    id = Column(Integer, primary_key=True)
    glyph_id = Column(Integer, ForeignKey('glyph.id'))
    master_id = Column(Integer, ForeignKey('master.id'))
    user_id = Column(Integer, ForeignKey('users.id'))

    glyphname = Column(String(3), index=True)
    fontsource = Column(Enum('A', 'B'), index=True)
    pointnr = Column(Integer, index=True)
    x = Column(Integer)
    y = Column(Integer)


class GlyphParam(Base, UserQueryMixin):

    __tablename__ = 'glyphparam'

    id = Column(Integer, primary_key=True)
    glyph_id = Column(Integer, ForeignKey('glyph.id'))
    glyphoutline_id = Column(Integer, ForeignKey('glyphoutline.id'))

    fontsource = Column(Enum('A', 'B'), index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    master_id = Column(Integer, ForeignKey('master.id'))

    pointname = Column(String(32))
    groupname = Column(String(32))
    startp = Column(Integer)
    doubledash = Column(Integer)
    tripledash = Column(Integer)
    superleft = Column(Float)
    superright = Column(Float)
    leftp = Column(Integer)
    rightp = Column(Integer)
    downp = Column(Integer)
    upp = Column(Integer)
    dir = Column(String(32))
    leftp2 = Column(Integer)
    rightp2 = Column(Integer)
    downp2 = Column(Integer)
    upp2 = Column(Integer)
    dir2 = Column(String(32))
    tension = Column(String(32))
    tensionand = Column(String(32))
    cycle = Column(Integer)
    penshifted = Column(String(32))
    pointshifted = Column(String(32))
    angle = Column(String(32))
    penwidth = Column(String(32))
    overx = Column(String(32))
    overbase = Column(String(32))
    overcap = Column(String(32))
    overasc = Column(String(32))
    overdesc = Column(String(32))
    ascpoint = Column(Integer)
    descpoint = Column(Integer)
    stemcutter = Column(String(32))
    stemshift = Column(String(32))
    inktrap_l = Column(Float)
    inktrap_r = Column(Float)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


if __name__ == "__main__":
    metadata = Base.metadata
    metadata.create_all(engine)
