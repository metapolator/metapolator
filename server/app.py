# -*- coding: utf-8 -*-
from tornado import ioloop, web, websocket


class IndexHandler(web.RequestHandler):

    def get(self):
        return self.render('index.html')


class EchoWebSocket(websocket.WebSocketHandler):

    def on_message(self, message):
        self.write_message(u"You said: " + message)


app = web.Application([
    (r'/', IndexHandler),
    (r'/ws', EchoWebSocket)
])


if __name__ == '__main__':
    app.listen(8888)
    ioloop.IOLoop.instance().start()
