# -*- coding: utf-8 -*-
from tornado import ioloop, web, websocket


listeners = []


class IndexHandler(web.RequestHandler):

    def get(self):
        return self.render('index.html')


class EchoWebSocket(websocket.WebSocketHandler):

    def open(self):
        listeners.append(self)

    def on_message(self, message):
        for w in listeners:
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
