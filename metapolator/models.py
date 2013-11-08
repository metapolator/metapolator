import os.path as op
import web

from sqlalchemy import Column, Integer, String, Text, Enum, Float, \
    Boolean, DateTime
from sqlalchemy import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm.exc import NoResultFound

from config import engine, session, working_dir

Base = declarative_base()


def query(model_klass, *args, **kwargs):
    return web.ctx.orm.query(model_klass, *args, **kwargs)


class User(Base):

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, index=True)
    password = Column(String)
    email = Column(String)
    is_admin = Column(Boolean)
    date_joined = Column(DateTime)


class Glyph(Base):

    __tablename__ = 'glyph'

    id = Column(Integer, primary_key=True)
    idmaster = Column(Integer, index=True)
    fontsource = Column(Enum('A', 'B'), index=True)
    user_id = Column(Integer, index=True)
    name = Column(String(3), index=True)
    width = Column(Integer)
    unicode = Column(Text)

    @classmethod
    def create(cls, **kwargs):
        kwargs['user_id'] = session.user
        glyph = cls(**kwargs)
        web.ctx.orm.add(glyph)
        web.ctx.orm.commit()
        return glyph

    @classmethod
    def filter(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        return query(cls).filter_by(**kwargs)

    @classmethod
    def get(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None


class GlyphOutline(Base):

    __tablename__ = 'glyphoutline'

    id = Column(Integer, primary_key=True)
    glyphname = Column(String(3), index=True)
    idmaster = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    fontsource = Column(Enum('A', 'B'), index=True)
    pointnr = Column(Integer, index=True)
    x = Column(Integer)
    y = Column(Integer)

    @classmethod
    def filter(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        return query(cls).filter_by(**kwargs)

    @classmethod
    def exists(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        return bool(query(func.count(cls.id)).filter_by(**kwargs).scalar())

    @classmethod
    def create(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        outline = cls(**kwargs)
        web.ctx.orm.add(outline)
        web.ctx.orm.commit()
        return outline

    @classmethod
    def get(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None


class GlyphParam(Base):

    __tablename__ = 'glyphparam'

    id = Column(Integer, primary_key=True)
    glyphname = Column(String(32), index=True)
    fontsource = Column(Enum('A', 'B'), index=True)
    user_id = Column(Integer, index=True)
    idmaster = Column(Integer, index=True)
    pointnr = Column(Integer, index=True)

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

    @classmethod
    def create(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        master = cls(**kwargs)
        web.ctx.orm.add(master)
        web.ctx.orm.commit()
        return master

    @classmethod
    def get(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None


class GroupParam(Base):

    __tablename__ = 'groupparam'

    id = Column(Integer, primary_key=True)
    idmaster = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    groupname = Column(String, index=True)

    startp = Column(Integer)
    doubledash = Column(Integer)
    tripledash = Column(Integer)
    superleft = Column(Float)
    superright = Column(Float)
    leftp = Column(Integer)
    rightp = Column(Integer)
    downp = Column(Integer)
    upp = Column(Integer)
    dir = Column(String)
    leftp2 = Column(Integer)
    rightp2 = Column(Integer)
    downp2 = Column(Integer)
    upp2 = Column(Integer)
    dir2 = Column(String)
    tension = Column(String)
    tensionand = Column(String)
    cycle = Column(Integer)
    penshifted = Column(String)
    pointshifted = Column(String)
    angle = Column(String)
    penwidth = Column(String)
    overx = Column(String)
    overbase = Column(String)
    overcap = Column(String)
    overasc = Column(String)
    overdesc = Column(String)
    ascpoint = Column(Integer)
    descpoint = Column(Integer)
    stemcutter = Column(String)
    stemshift = Column(String)
    inktrap_l = Column(Float)
    inktrap_r = Column(Float)


class Master(Base):

    __tablename__ = 'master'

    idmaster = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)
    fontname = Column(String, index=True)
    fontnamea = Column(String)
    fontnameb = Column(String)
    idlocala = Column(Integer, index=True)
    idlocalb = Column(Integer, index=True)
    idglobal = Column(Integer, index=True)

    def get_glyph(self, glyphid, ab_source='A'):
        try:
            q = Glyph.filter(idmaster=self.idmaster,
                             name=glyphid, fontsource=ab_source.upper())
            return q.one()
        except NoResultFound:
            return

    def get_fonts_directory(self, ab_source=None):
        """
        Return uploaded user font project directory.

        If ab_source set then return FontA or FontB directories in fonts
        project directory.

        >>> master = query(Master).filter(idmaster=1).one()
        >>> master.get_fonts_directory()
        /var/www/webpy-app/metapolator/users/1/fonts/1
        >>> master.get_fonts_directory('a')
        /var/www/webpy-app/metapolator/users/1/fonts/1/FontNameA.UFO
        >>> master.get_fonts_directory('b')
        /var/www/webpy-app/metapolator/users/1/fonts/1/FontNameB.UFO

        If FontB is not set then it returns FontA for that

        >>> master = query(Master).filter(idmaster=2).one()
        >>> master.get_fonts_directory()
        /var/www/webpy-app/metapolator/users/1/fonts/1
        >>> master.get_fonts_directory('a')
        /var/www/webpy-app/metapolator/users/1/fonts/1/FontNameA.UFO
        >>> master.get_fonts_directory('b')
        /var/www/webpy-app/metapolator/users/1/fonts/1/FontNameA.UFO
        """
        fonts_directory = op.join(working_dir(), 'fonts', str(self.idmaster))
        if not ab_source:
            return fonts_directory
        if ab_source.lower() == 'a':
            return op.join(fonts_directory, self.fontnamea)
        elif ab_source.lower() == 'b' and self.fontnameb:
            return op.join(fonts_directory, self.fontnameb)
        return op.join(fonts_directory, self.fontnamea)

    @classmethod
    def exists(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        return bool(query(func.count(cls.idmaster)).filter_by(**kwargs).scalar())

    @classmethod
    def create(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        master = cls(**kwargs)
        web.ctx.orm.add(master)
        web.ctx.orm.commit()
        return master

    @classmethod
    def update(cls, values={}, **kwargs):
        if not values:
            return
        query(cls).filter_by(**kwargs).update(values)

    @classmethod
    def get(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None

    @classmethod
    def all(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        return query(cls).filter_by(**kwargs)


class LocalParam(Base):

    __tablename__ = 'localparam'

    idlocal = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)

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

    @classmethod
    def get(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None

    @classmethod
    def all(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        return query(cls).filter_by(**kwargs)

    @classmethod
    def update(cls, values={}, **kwargs):
        if not values:
            return
        query(cls).filter_by(**kwargs).update(values)

    @classmethod
    def create(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        instance = cls(**kwargs)
        web.ctx.orm.add(instance)
        web.ctx.orm.commit()
        return instance


class GlobalParam(Base):

    __tablename__ = 'globalparam'

    idglobal = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True)

    metapolation = Column(Float, default=0)
    unitwidth = Column(Float, default=0)
    fontsize = Column(Float, default=10)
    mean = Column(Float, default=5)
    cap = Column(Float, default=8)
    ascl = Column(Float, default=2)
    des = Column(Float, default=2)
    box = Column(Float, default=10)

    @classmethod
    def get(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None

    @classmethod
    def all(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        return query(cls).filter_by(**kwargs)

    @classmethod
    def create(cls, **kwargs):
        kwargs.update({'user_id': session.user})
        instance = cls(**kwargs)
        web.ctx.orm.add(instance)
        web.ctx.orm.commit()
        return instance


if __name__ == "__main__":
    metadata = Base.metadata
    metadata.create_all(engine)
