import datetime
import os
import os.path as op
import re
import web

if __name__ == "__main__":
    import sys
    PATH = op.dirname(op.abspath(__file__))
    sys.path.append(op.join(PATH, '..'))


from sqlalchemy import Column, Integer, String, Text, Enum, Float, \
    Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.orm.exc import NoResultFound

from metapolator.base.config import engine, working_dir
from metapolator.base.dbapi import UserQueryMixin, query


LABELS = range(ord('A'), ord('Z') + 1)


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
        user.is_admin = False
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
    capital = Column(Float, default=6)
    ascender = Column(Float, default=6.5)
    descender = Column(Float, default=-2)
    skeleton = Column(Float, default=0)
    over = Column(Float, default=0.1)
    jut = Column(Float, default=1)
    slab = Column(Float, default=1)
    bracket = Column(Float, default=1)
    serif_darkness = Column(Float, default=1)
    slant = Column(Float, default=1)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class GlobalParam(Base, UserQueryMixin):

    __tablename__ = 'globalparam'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))

    metapolation = Column(Float, default=0)
    unitwidth = Column(Float, default=1)
    fontsize = Column(Float, default=10)
    mean = Column(Float, default=5, doc='height of lower case')
    cap = Column(Float, default=6, doc='height of uppercase')
    asc = Column(Float, default=6.5, doc='height of talle characters')
    des = Column(Float, default=-2, doc='lowest point in glyphs')
    box = Column(Float, default=10)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Project(Base, UserQueryMixin):

    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    masters = Column(String(128), default='')
    mfparser = Column(String(128), default='')
    currentglyph = Column(String(128), index=True, default='')

    projectname = Column(String(128), index=True)

    def create_master(self):
        version = Master.max(Master.version, project_id=self.id) or 0
        return Master.create(project_id=self.id, version=(version + 1))

    def get_ordered_masters(self):
        from tools import unifylist
        # we should unify masters list in case if some masters absence
        # and raise error if unavailable
        _masters = unifylist(self.masters.split(','))

        # masters are passed here as ordered array of masters ids as they
        # placed on editor page
        instances = Master.all().filter(Master.id.in_(self.masters.split(',')))

        masters = []
        for p in _masters:
            for m in instances:
                if m.id == int(p):
                    masters.append(m)
                    break
        return masters

    def get_instancelog(self, version=1, ab_source=None):
        if ab_source:
            return op.join(working_dir(),
                           '%s-%03d.log' % (self.projectname, version))
        return op.join(working_dir(), '%s.log' % (self.projectname))

    def get_basename(self):
        return self.projectname

    def get_directory(self, version=1):
        directory = op.join(working_dir(), '%s-%03d' % (self.projectname,
                                                        version))
        if not op.exists(directory):
            os.makedirs(directory)
        return directory


class Metapolation(Base, UserQueryMixin):

    __tablename__ = 'metapolations'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    project_id = Column(Integer, ForeignKey('projects.id'))
    label = Column(String(2), index=True)
    value = Column(Float, default=0)


class Instance(Base, UserQueryMixin):

    __tablename__ = 'instances'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    project_id = Column(Integer, ForeignKey('projects.id'))
    archived = Column(Boolean, index=True, default=False)


class Master(Base, UserQueryMixin):

    __tablename__ = 'master'

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('projects.id'))
    user_id = Column(Integer, ForeignKey('users.id'))

    idlocala = Column(Integer, ForeignKey('localparam.id'))
    idglobal = Column(Integer, ForeignKey('globalparam.id'))
    version = Column(Integer, default=0, index=True)

    name = Column(String(128), default='')

    project = relationship('Project', backref='projects')

    task_id = Column(String(128), default='')
    task_created = Column(DateTime)
    task_completed = Column(Boolean, default=False)
    task_updated = Column(DateTime)

    def update_masters_ordering(self, axislabel):
        project = self.project

        index = LABELS.index(ord(axislabel))
        masters = project.masters.split(',')
        if index > len(masters) - 1:
            masters.append(self.id)
        else:
            masters[index] = self.id
        project.masters = ','.join(map(str, masters))
        web.ctx.orm.commit()

    def get_glyphs(self):
        return Glyph.filter(master_id=self.id).order_by(Glyph.name.asc())

    def get_ufo_path(self):
        fontpath = self.get_fonts_directory()
        return op.join(fontpath, '%s-%03d.ufo' % (self.project.projectname,
                                                  self.version))

    def get_metafont(self, ab_source=None):
        if ab_source:
            return '%s-%03d' % (self.project.projectname, self.version)
        return self.project.projectname

    def metafont_filepath(self, ab_source=None):
        return op.join(self.get_fonts_directory(),
                       self.get_metafont(ab_source) + '.mf')

    def metafont_exists(self):
        try:
            return op.exists(self.metafont_filepath('a'))
        except ValueError:
            pass

    def get_fonts_directory(self):
        return self.project.get_directory(self.version)


class Glyph(Base, UserQueryMixin):

    __tablename__ = 'glyph'

    id = Column(Integer, primary_key=True)
    master_id = Column(Integer, ForeignKey('master.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    project_id = Column(Integer, ForeignKey('projects.id'))

    fontsource = Column(Enum('A', 'B'), index=True)
    name = Column(String(3), index=True)
    width = Column(Integer, default=0)
    width_new = Column(Integer)

    original_glyph_contours = Column(Text)

    master = relationship('Master', backref='master')

    def get_zpoints(self):
        points = query(GlyphOutline, GlyphParam)
        points = points.filter(GlyphOutline.glyph_id == self.id)
        points = points.filter(GlyphParam.glyphoutline_id == GlyphOutline.id)
        zpoints = []
        for outline, param in points.order_by(GlyphOutline.pointnr.asc()):
            if re.match('z\d+[rl]', param.pointname):
                zpoints.append(param)
        return zpoints


class GlyphOutline(Base, UserQueryMixin):

    __tablename__ = 'glyphoutline'

    id = Column(Integer, primary_key=True)
    glyph_id = Column(Integer, ForeignKey('glyph.id'))
    master_id = Column(Integer, ForeignKey('master.id'))
    user_id = Column(Integer, ForeignKey('users.id'))

    glyph = relationship('Glyph', backref='glyph')

    glyphname = Column(String(3), index=True)
    fontsource = Column(Enum('A', 'B'), index=True)
    pointnr = Column(Integer, index=True)
    x = Column(Integer)
    y = Column(Integer)


class GlyphParam(Base, UserQueryMixin):

    __tablename__ = 'glyphparam'

    glyphoutline = relationship('GlyphOutline', backref='glyphoutline')

    id = Column(Integer, primary_key=True)
    glyph_id = Column(Integer, ForeignKey('glyph.id'))
    glyphoutline_id = Column(Integer, ForeignKey('glyphoutline.id'))

    fontsource = Column(Enum('A', 'B'), index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    master_id = Column(Integer, ForeignKey('master.id'))

    pointname = Column(String(32))
    type = Column(String(32))
    control_in = Column(String(32))
    control_out = Column(String(32))
    startp = Column(Integer)
    doubledash = Column(String(32))
    tripledash = Column(String(32))
    leftp = Column(String(32))
    rightp = Column(String(32))
    downp = Column(String(32))
    upp = Column(String(32))
    dir = Column(String(32))
    leftp2 = Column(String(32))
    rightp2 = Column(String(32))
    downp2 = Column(String(32))
    upp2 = Column(String(32))
    dir2 = Column(String(32))
    tensionand = Column(String(32))
    penshifted = Column(String(32))
    pointshifted = Column(String(32))
    angle = Column(String(32))
    penwidth = Column(String(32))
    overx = Column(String(32))
    overbase = Column(String(32))
    overcap = Column(String(32))
    overasc = Column(String(32))
    overdesc = Column(String(32))

    theta = Column(String(32))
    serif_h_bot = Column(String(32))
    serif_h_top = Column(String(32))
    serif_v_left = Column(String(32))
    serif_v_right = Column(String(32))

    def copy(self, newglyphoutline_obj):

        return GlyphParam.create(
            glyph_id=newglyphoutline_obj.glyph_id,
            glyphoutline_id=newglyphoutline_obj.id,
            master_id=newglyphoutline_obj.master_id,

            pointname=self.pointname,
            type=self.type,
            control_in=self.control_in,
            control_out=self.control_out,
            startp=self.startp,
            doubledash=self.doubledash,
            tripledash=self.tripledash,
            leftp=self.leftp,
            rightp=self.rightp,
            downp=self.downp,
            upp=self.upp,
            dir=self.dir,
            leftp2=self.leftp2,
            rightp2=self.rightp2,
            downp2=self.downp2,
            upp2=self.upp2,
            dir2=self.dir2,
            tensionand=self.tensionand,
            penshifted=self.penshifted,
            pointshifted=self.pointshifted,
            angle=self.angle,
            penwidth=self.penwidth,
            overx=self.overx,
            overbase=self.overbase,
            overcap=self.overcap,
            overasc=self.overasc,
            overdesc=self.overdesc,
            theta=self.theta,
            serif_h_bot=self.serif_h_bot,
            serif_h_top=self.serif_h_top,
            serif_v_left=self.serif_v_left,
            serif_v_right=self.serif_v_right)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


if __name__ == "__main__":
    metadata = Base.metadata
    metadata.create_all(engine)
