import web

from sqlalchemy import func
from sqlalchemy.orm.exc import NoResultFound


def query(model_klass, *args, **kwargs):
    return web.ctx.orm.query(model_klass, *args, **kwargs)


class UserQueryMixin(object):

    @classmethod
    def exists(cls, **kwargs):
        kwargs.update({'user_id': web.ctx.user.id})
        return bool(query(func.count(cls.id)).filter_by(**kwargs).scalar())

    @classmethod
    def max(cls, field, **kwargs):
        kwargs.update({'user_id': web.ctx.user.id})
        return query(func.max(field)).filter_by(**kwargs).scalar()

    @classmethod
    def filter(cls, **kwargs):
        kwargs.update({'user_id': web.ctx.user.id})
        return query(cls).filter_by(**kwargs)

    @classmethod
    def create(cls, **kwargs):
        kwargs.update({'user_id': web.ctx.user.id})
        instance = cls(**kwargs)
        web.ctx.orm.add(instance)
        web.ctx.orm.commit()
        return instance

    @classmethod
    def update(cls, values={}, **kwargs):
        kwargs.update({'user_id': web.ctx.user.id})
        if not values:
            return
        query(cls).filter_by(**kwargs).update(values)

    @classmethod
    def get(cls, **kwargs):
        kwargs.update({'user_id': web.ctx.user.id})
        try:
            return query(cls).filter_by(**kwargs).one()
        except NoResultFound:
            return None

    @classmethod
    def delete(cls, instance):
        web.ctx.orm.delete(instance)

    @classmethod
    def all(cls, **kwargs):
        kwargs.update({'user_id': web.ctx.user.id})
        return query(cls).filter_by(**kwargs)
