# -*- coding: utf-8 -*-
import os
import simplejson
import sys

SERVER_PYTHON_ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.append(os.path.join(SERVER_PYTHON_ROOT, '..'))

from tornado import ioloop, web, websocket

from metapolator.tools import get_json


listeners = []


class IndexHandler(web.RequestHandler):

    def get(self):
        return self.render('index.html')


class EchoWebSocket(websocket.WebSocketHandler):

    def open(self):
        listeners.append(self)

    def on_message(self, message):
        for w in listeners:
            if not w:
                listeners.remove(w)
                continue
            if message == 'get':
                try:
                    fp = open(os.path.join(SERVER_PYTHON_ROOT, 'font.log'))
                    content = fp.read()
                    fp.close()
                except (IOError, OSError):
                    return {}
                message = simplejson.dumps(get_json(content, 39), indent=2)
            w.write_message(message)

    def on_close(self):
        listeners.remove(self)


app = web.Application([
    (r'/', IndexHandler),
    (r'/ws', EchoWebSocket)
])


if __name__ == '__main__':
    app.listen(8888)
    ioloop.IOLoop.instance().start()
