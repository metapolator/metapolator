import simplejson
import web

from metapolator import models
from metapolator.log2json import get_edges_json
from metapolator.metapost import Metapost
from metapolator.tools import prepare_master_environment
from metapolator.views import raise404_notauthorized


class CreateMaster:

    def create_glyphpoint(self, glyph, pointnr, pointparam, point):
        kwargs = dict(glyph_id=glyph.id, master_id=glyph.master_id,
                      glyphname=glyph.name,
                      pointnr=pointnr, x=int(float(point['x'])),
                      y=int(float(point['y'])))
        glyphoutline = models.GlyphOutline.create(**kwargs)
        models.GlyphParam.create(glyphoutline_id=glyphoutline.id,
                                 glyph_id=glyph.id,
                                 master_id=glyph.master_id,
                                 pointname=pointparam.pointname,
                                 startp=pointparam.startp,
                                 type=pointparam.type,
                                 control_in=pointparam.control_in,
                                 control_out=pointparam.control_out,
                                 doubledash=pointparam.doubledash,
                                 tripledash=pointparam.tripledash,
                                 leftp=pointparam.leftp,
                                 rightp=pointparam.rightp,
                                 downp=pointparam.downp,
                                 upp=pointparam.upp,
                                 dir=pointparam.dir,
                                 leftp2=pointparam.leftp2,
                                 rightp2=pointparam.rightp2,
                                 downp2=pointparam.downp2,
                                 upp2=pointparam.upp2,
                                 dir2=pointparam.dir2,
                                 tensionand=pointparam.tensionand,
                                 penshifted=pointparam.penshifted,
                                 pointshifted=pointparam.pointshifted,
                                 angle=pointparam.angle,
                                 penwidth=pointparam.penwidth,
                                 overx=pointparam.overx,
                                 overbase=pointparam.overbase,
                                 overcap=pointparam.overcap,
                                 overasc=pointparam.overasc,
                                 overdesc=pointparam.overdesc)

    def round(self, coord):
        return int(round(float(coord)))

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id=0)

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        masters = project.get_ordered_masters()

        master = project.create_master()
        web.ctx.orm.commit()

        prepare_master_environment(master)

        metapost = Metapost(project)
        metapost.execute_interpolated_bulk()

        primary_master = masters[0]

        master.name = primary_master.name
        logpath = project.get_instancelog(version=primary_master.version)
        for glyph in primary_master.get_glyphs():
            json = get_edges_json(logpath, glyph.name)
            if not json:
                error = ('could not find any contours for '
                         'instance in %s for %s') % (logpath, glyph.name)
                raise web.badrequest(simplejson.dumps({'error': error}))

            zpoints = glyph.get_zpoints()

            points = []
            for i, contourpoints in enumerate(json[0]['contours']):
                if not contourpoints:
                    error = ('could not find any points in contour '
                             'for instance in %s') % logpath
                    raise web.badrequest(simplejson.dumps({'error': error}))
                metapost_points = []
                for point in contourpoints:
                    if project.mfparser == 'controlpoints':
                        p = {'x': self.round(point['controls'][0]['x']),
                             'y': self.round(point['controls'][0]['y'])}
                        metapost_points.append(p)

                    metapost_points.append({'x': self.round(point['x']),
                                            'y': self.round(point['y'])})

                    if project.mfparser == 'controlpoints':
                        p = {'x': self.round(point['controls'][1]['x']),
                             'y': self.round(point['controls'][1]['y'])}
                        metapost_points.append(p)
                if project.mfparser == 'controlpoints' and metapost_points:
                    if i != 0:
                        points_ = metapost_points[1:] + metapost_points[:1]
                        points += points_
                    else:
                        points_ = metapost_points[2:] + metapost_points[:2]
                        points += points_[::-1]
                else:
                    points += metapost_points

            if len(zpoints) != len(points):
                error = '%s zp != mp %s' % (len(zpoints), len(points))
                raise web.badrequest(simplejson.dumps({'error': error}))

            newglypha = models.Glyph.create(master_id=master.id,
                                            name=glyph.name,
                                            width=glyph.width,
                                            project_id=glyph.project_id)

            i = 0
            for point in points:
                self.create_glyphpoint(newglypha, (i + 1), zpoints[i], point)
                i += 1

        project.masters = ','.join([str(master.id)] * len(masters))
        web.ctx.orm.commit()
        return simplejson.dumps({'versions': project.get_versions()})
