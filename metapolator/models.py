import datetime
import os
import os.path as op
import re
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
        return master.order_by(Master.version.desc()).first()

    def get_instancelog(self, version=1, ab_source=None):
        if ab_source:
            return op.join(working_dir(),
                           '%s.%s.%03d.log' % (self.projectname,
                                               ab_source.upper(), version))
        return op.join(working_dir(),
                       '%s.%03d.log' % (self.projectname, version))

    def get_directory(self, version=1):
        directory = op.join(working_dir(), '%s.%03d' % (self.projectname,
                                                        version))
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
        path = op.join(fontpath, '%s.%s.%03d.ufo' % (self.project.projectname,
                                                     ab_source,
                                                     self.version))
        if not op.exists(path):
            return op.join(fontpath, '%s.%s.%03d.ufo' % (self.project.projectname,
                                                         'A', self.version))
        return path

    def get_metafont(self, ab_source=None):
        if ab_source:
            return '%s.%s.%03d' % (self.project.projectname,
                                   ab_source.upper(), self.version)
        return '%s.%03d' % (self.project.projectname, self.version)

    def metafont_filepath(self, ab_source=None):
        return op.join(self.get_fonts_directory(),
                       self.get_metafont(ab_source) + '.mf')

    def metafont_exists(self, ab_source=None):
        try:
            return op.exists(self.metafont_filepath(ab_source))
        except ValueError:
            pass

    def get_fonts_directory(self, ab_source=None):
        return self.project.get_directory(self.version)


class Glyph(Base, UserQueryMixin):

    __tablename__ = 'glyph'

    id = Column(Integer, primary_key=True)
    master_id = Column(Integer, ForeignKey('master.id'))
    user_id = Column(Integer, ForeignKey('users.id'))

    fontsource = Column(Enum('A', 'B'), index=True)
    name = Column(String(3), index=True)
    width = Column(Integer)
    unicode = Column(Text)

    def get_zpoints(self):
        points = query(GlyphOutline, GlyphParam)
        points = points.filter(GlyphOutline.glyph_id == self.id)
        points = points.filter(GlyphParam.glyphoutline_id == GlyphOutline.id)
        zpoints = []
        for outline, param in points.order_by(GlyphOutline.pointnr.asc()):
            if re.match('z\d+[rl]', param.pointname):
                zpoints.append(param)
        return zpoints

    def flushparams(self):
        GlyphParam.update(glyph_id=self.id, values=dict(doubledash=None,
                                                        tripledash=None,
                                                        superleft=None,
                                                        superright=None,
                                                        leftp=None,
                                                        rightp=None,
                                                        downp=None,
                                                        upp=None,
                                                        dir=None,
                                                        leftp2=None,
                                                        rightp2=None,
                                                        downp2=None,
                                                        upp2=None,
                                                        dir2=None,
                                                        tension=None,
                                                        tensionand=None,
                                                        cycle=None,
                                                        penshifted=None,
                                                        pointshifted=None,
                                                        angle=None,
                                                        penwidth=None,
                                                        overx=None,
                                                        overbase=None,
                                                        overcap=None,
                                                        overasc=None,
                                                        overdesc=None,
                                                        ascpoint=None,
                                                        descpoint=None,
                                                        stemcutter=None,
                                                        stemshift=None,
                                                        inktrap_l=None,
                                                        inktrap_r=None))


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
