from sqlalchemy import Column, Integer, String, Text, Enum
from sqlalchemy.ext.declarative import declarative_base

from config import engine

Base = declarative_base()


class Glyph(Base):

    __tablename__ = 'glyph'

    id = Column(Integer, primary_key=True)
    glyphName = Column(String(3), index=True)
    width = Column(Integer)
    unicode = Column(Text)
    user_id = Column(Integer)
    idmaster = Column(Integer, index=True)
    fontsource = Column(Enum('A', 'B'), index=True)


if __name__ == "__main__":
    metadata = Base.metadata
    metadata.create_all(engine)
