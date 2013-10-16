# -*- coding: utf-8 -*-
import os
import re
import simplejson

from tornado import ioloop, web, websocket


listeners = []
SERVER_PYTHON_ROOT = os.path.abspath(os.path.dirname(__file__))


class IndexHandler(web.RequestHandler):

    def get(self):
        return self.render('index.html')


def get_json(filename):
    try:
        fp = open(filename)
        content = fp.read()
        fp.close()
    except (IOError, OSError):
        pass

    contour_pattern = re.compile(r'Filled\scontour\s:\n(.*?)..cycle', re.I | re.S | re.M)
    point_pattern = re.compile(r'\(((-?\d+.?\d+),(-?\d+.\d+))\)..controls\s\(((-?\d+.?\d+),(-?\d+.\d+))\)\sand\s\(((-?\d+.?\d+),(-?\d+.\d+))\)')

    pattern = re.findall(r'Edge structure(.*?)End edge', content,
                         re.I | re.DOTALL | re.M)

    edges = []
    for edge in pattern:
        contours = []
        for contour in contour_pattern.findall(edge.strip()):
            contour = re.sub('\n(\S)', '\\1', contour)
            for point in contour.split('\n'):
                point = point.strip().strip('..')
                match = point_pattern.match(point)
                if match:
                    x_point, y_point = match.group(1).split(',')
                    x_control_1, y_control_1 = match.group(4).split(',')
                    x_control_2, y_control_2 = match.group(7).split(',')

                    contours.append({'x': x_point, 'y': y_point,
                                     'controls': [{'x': x_control_1,
                                                   'y': y_control_1},
                                                  {'x': x_control_2,
                                                   'y': y_control_2}]})
        edges.append(contours)

    return {'total_edges': len(edges), 'edges': edges}


class EchoWebSocket(websocket.WebSocketHandler):

    def open(self):
        listeners.append(self)

    def on_message(self, message):
        for w in listeners:
            if not w:
                listeners.remove(w)
                continue
            if message == 'get':
                message = simplejson.dumps(get_json(os.path.join(SERVER_PYTHON_ROOT, 'font.log')))
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
