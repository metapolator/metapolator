import redis
import web

SESSION = 'SESSION:'


class RedisStore(web.session.Store):

    """Store for saving a session in redis:
    import rediswebpy
    session = web.session.Session(app, rediswebpy.RedisStore(), initializer={'count': 0})
    """
    def __init__(self, ip='localhost', port=6379, db=0, initial_flush=False):
        self.redis_server = redis.Redis(ip, port, db)
        if initial_flush:
            """
            flushing the database is very important when you update your
            Session object initializer dictionary argument.
            E.g.
            # Before Update:
            session = web.session.Session(app,
                                          rediswebpy.RedisStore(initial_flush=True),
                                          initializer={'a':1})
            # After Update:
            session = web.session.Session(app,
                                          rediswebpy.RedisStore(initial_flush=True),
                                          initializer={'a':1, 'b':2})
            # This will cause an error if initial_flush=False since existing
            # sessions in Redis will not contain the key 'b'.
            """
            self.redis_server.flushdb()

    def __contains__(self, key):
        # test if session exists for given key
        return bool(self.redis_server.get(SESSION + key))

    def __getitem__(self, key):
        # attempt to get session data from redis store for given key
        data = self.redis_server.get(SESSION + key)
        # if the session existed for the given key
        if data:
            # update the expiration time
            self.redis_server.expire(SESSION + key,
                                     web.webapi.config.session_parameters.timeout)
            return self.decode(data)
        else:
            raise KeyError

    def __setitem__(self, key, value):
        # set the redis value for given key to the encoded value, and reset the
        # expiration time
        self.redis_server.set(SESSION + key,
                              self.encode(value))
        self.redis_server.expire(SESSION + key,
                                 web.webapi.config.session_parameters.timeout)

    def __delitem__(self, key):
        self.redis_server.delete(SESSION + key)

    def cleanup(self, timeout):
        # since redis takes care of expiration for us, we don't need to do any
        # clean up
        pass
