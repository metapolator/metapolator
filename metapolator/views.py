# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang, Vitaly Volkov
#
# http: //github.com/metapolator
#
# GPL v3 (http: //www.gnu.org/copyleft/gpl.html).

""" Basic metafont point interface using webpy  """
import mimetypes
import models
import os
import os.path as op
import re
import shutil
import web
import zipfile
import simplejson

from web import seeother
from passlib.hash import bcrypt

from config import app, is_loggedin, session, working_dir, \
    working_url, PROJECT_ROOT, MFLIST
from forms import GlobalParamForm, RegisterForm, LocalParamForm, \
    PointParamExtendedForm
from tools import put_font_all_glyphs, project_exists, write_glyph_list, \
    write_global_param, makefont_single, unifylist, get_edges_json, \
    get_edges_json_from_db


def raise404_notauthorized(func):

    def f(*args, **kwargs):
        if not is_loggedin():
            raise seeother('/login')
        return func(*args, **kwargs)

    return f


### Templates
t_globals = {
    'datestr': web.datestr,
    'working_url': working_url,
    'is_loggedin': is_loggedin,
    'project_exists': project_exists,
    'webctx': web.ctx,
    'websession': session
}
render = web.template.render('templates', base='base', globals=t_globals)
###  classes


class GlyphPageMixin(object):

    _lftmaster = None
    _rgtmaster = None

    _lftversion = None
    _rgtversion = None

    _project = None

    def get_lft_master(self):
        if not self._lftmaster:
            raise Exception('Class was not initialized')
        return self._lftmaster

    def get_rgt_master(self):
        if not self._rgtmaster:
            raise Exception('Class was not initialized')
        return self._rgtmaster

    def get_lft_version(self):
        if not self._lftversion:
            raise Exception('Class was not initialized')
        return self._lftversion

    def get_rgt_version(self):
        if not self._rgtversion:
            raise Exception('Class was not initialized')
        return self._rgtversion

    def get_project(self):
        if not self._project:
            raise Exception('Class was not initialized')
        return self._project

    def initialize(self, projectname, lft_version, rgt_version):
        try:
            self._lftversion = int(lft_version)
            self._rgtversion = int(rgt_version)
        except TypeError:
            raise web.notfound()

        self._lftmaster = models.Project.get_master(projectname=projectname,
                                                    version=self.get_lft_version())
        if not self._lftmaster:
            raise web.notfound()

        self._rgtmaster = models.Project.get_master(projectname=projectname,
                                                    version=self.get_rgt_version())
        if not self._rgtmaster:
            raise web.notfound()

        self._project = models.Project.get(projectname=projectname)

    def set_masters(self, masters):
        self._masters = masters

    def call_metapost_all_glyphs(self, master, cell=''):
        write_global_param(self.get_project())

        hasglyphs = False
        for glyph in (master or self.get_lft_master()).get_glyphs():
            _glyphs = models.Glyph.filter(name=glyph.name)
            _glyphs = _glyphs.filter(models.Glyph.master_id.in_(map(lambda x: x.id, self._masters)))

            glyphs = []
            for m in self._masters:
                for g in _glyphs:
                    if g.master_id == m.id:
                        glyphs.append(g)
                        break

            if self.get_project().mfparser == 'controlpoints':
                import xmltomf_new_2axes as xmltomf
                xmltomf.xmltomf1(master or self.get_lft_master(), *list(glyphs))
            else:
                import xmltomf
                xmltomf.xmltomf1(master or self.get_lft_master(), *list(glyphs))
            hasglyphs = True

        if hasglyphs:
            write_glyph_list(master or self.get_lft_master())
            makefont_single(master or self.get_lft_master(), cell=cell)

    def call_metapost(self, glyph_id):
        write_global_param(self.get_project())

        _glyphs = models.Glyph.filter(name=glyph_id)
        _glyphs = _glyphs.filter(models.Glyph.master_id.in_(map(lambda x: x.id, self._masters)))

        glyphs = []
        for m in self._masters:
            for g in _glyphs:
                if g.master_id == m.id:
                    glyphs.append(g)
                    break

        if self.get_project().mfparser == 'controlpoints':
            import xmltomf_new_2axes as xmltomf
            xmltomf.xmltomf1(self.get_lft_master(), *list(glyphs))
        else:
            import xmltomf
            xmltomf.xmltomf1(self.get_lft_master(), *list(glyphs))

        write_glyph_list(self.get_lft_master(), glyph_id)
        makefont_single(self.get_lft_master())

    def get_glyphs_jsondata(self, glyphid, master):
        self.call_metapost(glyphid)

        project = self.get_project()

        instancelog = project.get_instancelog(self.get_lft_version())
        M_glyphjson = get_edges_json(instancelog, glyphid)

        glyph = models.Glyph.get(master_id=master.id, name=glyphid)

        instancelog = project.get_instancelog(master.version, 'a')
        if self.get_project().mfparser == 'controlpoints':
            import xmltomf_new_2axes as xmltomf
            xmltomf.xmltomf1(master, glyph)
        else:
            import xmltomf
            xmltomf.xmltomf1(master, glyph)

        write_glyph_list(master, glyph.name)
        makefont_single(master, cell='A')

        zpoints = get_edges_json_from_db(master, glyphid)

        glyphjson = get_edges_json(instancelog, glyphid)
        return {'M': M_glyphjson, 'R': glyphjson, 'zpoints': zpoints}


class Workspace(app.page):

    path = '/workspace/'

    @raise404_notauthorized
    def GET(self):
        web.ctx.pointparam_extended_form = PointParamExtendedForm()
        web.ctx.settings_form = LocalParamForm()
        return render.workspace()


class Glyph(app.page):

    path = '/editor/glyphs/'

    def glyphrepr(self, id):
        return MFLIST[int(id)]

    @raise404_notauthorized
    def GET(self):
        x = web.input(project_id='')
        glyphs = models.Glyph.filter(project_id=x.project_id)
        glyphs = glyphs.group_by(models.Glyph.name)
        glyphs = glyphs.order_by(models.Glyph.name.asc())
        return simplejson.dumps(map(lambda x: {'val': self.glyphrepr(x.name),
                                               'id': x.name}, glyphs))


class Project(app.page, GlyphPageMixin):

    path = '/editor/project/'

    @raise404_notauthorized
    def GET(self):
        prepare_environment_directory()

        x = web.input(project=0)

        project = models.Project.get(id=x.project)
        if not project:
            raise web.notfound()

        masters = project.get_ordered_masters()

        self.set_masters(masters)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)

        resultmasters = []

        for i, master in enumerate(masters):

            prepare_master_environment(master)

            self.call_metapost_all_glyphs(master, cell='A')
            master_instancelog = project.get_instancelog(master.version, 'A')

            glyphsdata = get_edges_json(master_instancelog, master=master)

            resultmasters.append({'glyphs': glyphsdata,
                                  'label': chr(LABELS[i]),
                                  'master_id': master.id})

        self.call_metapost_all_glyphs(self.get_lft_master())
        instancelog = project.get_instancelog(self.get_lft_master().version)
        metaglyphs = get_edges_json(instancelog)

        import operator
        masters = map(operator.attrgetter('id', 'version'),
                      models.Master.filter(project_id=project.id))
        return '%s(%s)' % (x.callback, simplejson.dumps({'projects': resultmasters,
                                                         'versions': get_versions(project.id),
                                                         'metaglyphs': metaglyphs,
                                                         'mode': project.mfparser}))


def mime_type(filename):
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'


class SwitchMFParser(app.page):

    path = '^/mfparser-switch/(pen|controlpoints)/$'

    def POST(self, mfparser):
        session.mfparser = mfparser
        raise seeother('/projects/')


class EditorLocals(app.page, GlyphPageMixin):

    path = '/editor/locals/'

    @raise404_notauthorized
    def GET(self):
        x = web.input(local_id=0)
        localparams = models.LocalParam.get(id=x.local_id)
        if not localparams:
            return simplejson.dumps({})
        return simplejson.dumps(localparams.as_dict())

    @raise404_notauthorized
    def POST(self):
        x = web.input(master_id=0)

        localparams = models.LocalParam.all()
        result = []
        for i, k in enumerate(localparams):
            dict_ = {'val': k.id, 'idx': i + 1}
            if x.master_id:
                master = models.Master.get(id=x.master_id)
                if master and k.id == master.idlocala:
                    dict_.update({'selected': True})
            result.append(dict_)
        return simplejson.dumps(result)

    @raise404_notauthorized
    def PUT(self):
        x = web.input()

        master = models.Master.get(id=x.get('master_id'))
        if not master:
            return web.notfound()

        params = []

        form = LocalParamForm()
        if form.validates():
            idlocal = form.d.idlocal
            values = form.d

            del values['idlocal']
            del values['save']

            if not int(idlocal):
                localparam = models.LocalParam.create(**values)
                master.idlocala = localparam.id
                params = [{'val': localparam.id,
                          'idx': models.LocalParam.all().count(),
                          'selected': True}]
            else:
                models.LocalParam.update(id=idlocal, values=values)
                localparam = models.LocalParam.get(id=idlocal)
                master.idlocala = localparam.id

        project = master.project

        masters = project.get_ordered_masters()

        self.set_masters(masters)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)

        self.call_metapost_all_glyphs(self.get_lft_master())
        instancelog = project.get_instancelog(self.get_lft_master().version)
        metaglyphs = get_edges_json(instancelog)

        prepare_master_environment(master)

        self.call_metapost_all_glyphs(master, cell='A')
        master_instancelog = project.get_instancelog(master.version, 'a')

        glyphsdata = get_edges_json(master_instancelog, master=master)

        return simplejson.dumps({'glyphs': glyphsdata,
                                 'metaglyphs': metaglyphs,
                                 'master_id': master.id,
                                 'params': params,
                                 'label': x.axislabel})


class userstatic(app.page):

    path = '/users/(.*)'

    def GET(self, path):
        # path = re.sub(r'[\.]{2,}+', '', path)
        try:
            file_name = web.ctx.path.split('/')[-1]
            web.header('Content-Type', mime_type(file_name))
            abspath = op.join(PROJECT_ROOT, 'users', path)
            return open(abspath, 'rb').read()
        except IOError:
            raise web.notfound()


class Index(app.page):

    path = '/'

    def GET(self):
        raise seeother('/projects/')


class Editor(app.page):

    path = '/editor/'

    @raise404_notauthorized
    def GET(self):
        web.ctx.pointparam_extended_form = PointParamExtendedForm()
        web.ctx.settings_form = LocalParamForm()
        return render.editor()


class EditorMetapolationSave(app.page, GlyphPageMixin):

    path = '/editor/save-metap/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id=0, label='', value=0, glyphname='')

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        models.Metapolation.update(label=postdata.label,
                                   project_id=postdata.project_id,
                                   values={'value': float(postdata.value)})
        web.ctx.orm.commit()

        masters = project.get_ordered_masters()

        self.set_masters(masters)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)
        result = self.get_glyphs_jsondata(postdata.glyphname, masters[0])
        return simplejson.dumps(result)


class EditorSavePoint(app.page, GlyphPageMixin):

    path = '/editor/save-point/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(id='')

        # @FIXME: must be changed to form with validation of available
        # arguments values.
        #
        # >>> form = EditorSavePointForm()
        # >>> if not form.validates():
        # >>>     raise web.notfound()
        if not models.GlyphOutline.exists(id=postdata.id):
            return web.notfound()
        glyphoutline = models.GlyphOutline.get(id=postdata.id)

        project = models.Project.get(id=glyphoutline.glyph.project_id)
        if not project:
            raise web.notfound()

        master = models.Master.get(id=glyphoutline.glyph.master_id)
        if not master:
            return web.notfound()

        masters = project.get_ordered_masters()

        self.set_masters(masters)

        form = PointParamExtendedForm()
        if form.validates():
            values = form.d
            glyphoutline.x = float(values['x'])
            glyphoutline.y = float(values['y'])

            del values['zpoint']
            del values['x']
            del values['y']
            for key in values:
                if values[key] == '':
                    values[key] = None
            models.GlyphParam.update(glyphoutline_id=postdata.id,
                                     values=values)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)
        result = self.get_glyphs_jsondata(glyphoutline.glyph.name, master)
        return simplejson.dumps(result)


class Projects(app.page):

    path = '/projects/'

    @raise404_notauthorized
    def GET(self):
        projects = models.Project.all()
        return render.projects(projects)


class EditorCanvasReload(app.page, GlyphPageMixin):

    path = '/editor/reload/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(master_id=0, glyphname='', axislabel='')

        master = models.Master.get(id=postdata.master_id)
        if not master:
            return web.notfound()

        project = master.project

        index = LABELS.index(ord(postdata.axislabel))
        masters = project.masters.split(',')
        if index > len(masters) - 1:
            masters.append(master.id)
        else:
            masters[index] = master.id
        project.masters = ','.join(map(str, masters))
        web.ctx.orm.commit()

        masters = project.get_ordered_masters()

        self.set_masters(masters)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)

        self.call_metapost_all_glyphs(self.get_lft_master())
        instancelog = project.get_instancelog(self.get_lft_master().version)
        metaglyphs = get_edges_json(instancelog)

        prepare_master_environment(master)

        self.call_metapost_all_glyphs(master, cell='A')
        master_instancelog = project.get_instancelog(master.version, 'a')

        glyphsdata = get_edges_json(master_instancelog, master=master)

        return simplejson.dumps({'glyphs': glyphsdata,
                                 'metaglyphs': metaglyphs,
                                 'master_id': master.id,
                                 'label': postdata.axislabel})


class EditorCreateInstance(app.page, GlyphPageMixin):

    path = '/editor/create-instance/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(masters='', project_id=0)

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        masters = project.get_ordered_masters()

        self.set_masters(masters)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)

        self.call_metapost_all_glyphs(self.get_lft_master())

        instance = models.Instance.create(project_id=project.id)

        for extension in ['-webfont.eot', '-webfont.ttf', '.otf']:
            source = project.get_basename() + extension
            dest_dir = op.join(working_dir(), 'instances')
            if not op.exists(dest_dir):
                os.makedirs(dest_dir)
            dest_file = op.join(dest_dir, '%s%s' % (instance.id, extension))
            try:
                shutil.copy(op.join(working_dir(), 'static', source), dest_file)
            except:
                pass

        return simplejson.dumps({})


class EditorGetProjectAxes(app.page):

    path = '/editor/project/(\d+)'

    @raise404_notauthorized
    def POST(self, project_id):
        project = models.Project.get(id=project_id)
        if not project:
            raise web.notfound()

        # masters = models.Master.filter(project_id=project.id, editable=True)
        # masters = masters.order_by(models.Master.editor_ordering.asc())

        if not project.masters:
            masters = models.Master.filter(project_id=project.id)
            project.masters = ','.join(map(lambda x: str(x.id), masters[:2]))
            web.ctx.orm.commit()

        masters = []
        for p in project.masters.split(','):
            for m in models.Master.filter(project_id=project.id):
                if m.id == int(p):
                    masters.append(m)
                    break

        masters = map(lambda x: int(x.id), unifylist(masters))
        zipped = zip(masters[::2], masters[1::2])
        return simplejson.dumps({'axes': map(list, zipped),
                                 'project_id': project_id})


def get_versions(project_id):
    masters = models.Master.filter(project_id=project_id)
    return map(lambda master: {'version': '{0:03d}'.format(master.version), 'master_id': master.id}, masters)


class EditorMaster(app.page):

    path = '/editor/get-master/'

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(project_id='', master_id='', label='', glyph='')

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        master = models.Master.get(id=postdata.master_id,
                                   project_id=postdata.project_id)
        if not master:
            raise web.notfound()

        label = get_metapolation_label(postdata.label)

        glyph = models.Glyph.filter(master_id=master.id)
        if not postdata.glyph:
            glyph = glyph.order_by(models.Glyph.name.asc()).first()
        else:
            glyph = glyph.filter(models.Glyph.name == postdata.glyph).first()

        versions = get_versions(postdata.project_id)
        return simplejson.dumps({'project_id': project.id,
                                 'master_id': master.id,
                                 'glyphname': glyph.name,
                                 'label': postdata.label,
                                 'metapolation': label,
                                 'version': '{0:03d}'.format(master.version),
                                 'versions': versions})


class EditorCreateMaster(app.page, GlyphPageMixin):

    path = '/editor/create-master/'

    def create_glyphpoint(self, glyph, pointnr, pointparam, point):
        kwargs = dict(glyph_id=glyph.id, master_id=glyph.master_id,
                      glyphname=glyph.name,
                      pointnr=pointnr, x=int(float(point['x'])),
                      y=int(float(point['y'])))
        glyphoutline = models.GlyphOutline.create(**kwargs)

        kwargs = dict(glyphoutline_id=glyphoutline.id,
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
        models.GlyphParam.create(**kwargs)

    def round(self, coord):
        return int(round(float(coord)))

    @raise404_notauthorized
    def POST(self):
        postdata = web.input(masters='', project_id=0, glyphname='')

        project = models.Project.get(id=postdata.project_id)
        if not project:
            raise web.notfound()

        # we should unify masters list in case if some masters absence
        # and raise error if unavailable
        _masters = unifylist(postdata.masters.split(','))

        # masters are passed here as ordered array of masters ids as they
        # placed on editor page
        instances = models.Master.all().filter(
            models.Master.id.in_(postdata.masters.split(',')))

        masters = []
        for p in _masters:
            for m in instances:
                if m.id == int(p):
                    masters.append(m)
                    break

        self.set_masters(masters)

        version = models.Master.max(models.Master.version,
                                    project_id=project.id)

        master = models.Master.create(project_id=project.id,
                                      version=(version + 1))
        prepare_master_environment(master)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)

        self.call_metapost_all_glyphs(self.get_lft_master())

        logpath = project.get_instancelog(version=self.get_lft_master().version)
        for glyph in self.get_lft_master().get_glyphs():
            json = get_edges_json(logpath, glyph.name)
            if not json['edges']:
                raise web.badrequest(simplejson.dumps({'error': 'could not find any contours for instance in %s' % logpath}))

            zpoints = glyph.get_zpoints()

            points = []
            for i, contourpoints in enumerate(json['edges'][0]['contours']):
                if not contourpoints:
                    raise web.badrequest(simplejson.dumps({'error': 'could not find any points in contour for instance in %s' % logpath}))
                metapost_points = []
                for point in contourpoints:
                    if session.get('mfparser', '') == 'controlpoints':
                        metapost_points.append({'x': self.round(point['controls'][0]['x']),
                                                'y': self.round(point['controls'][0]['y'])})

                    metapost_points.append({'x': self.round(point['x']),
                                            'y': self.round(point['y'])})

                    if session.get('mfparser', '') == 'controlpoints':
                        metapost_points.append({'x': self.round(point['controls'][1]['x']),
                                                'y': self.round(point['controls'][1]['y'])})
                if session.get('mfparser', '') == 'controlpoints' and metapost_points:
                    if i != 0:
                        points_ = metapost_points[1:] + metapost_points[:1]
                        points += points_
                    else:
                        points_ = metapost_points[2:] + metapost_points[:2]
                        points += points_[::-1]
                else:
                    points += metapost_points

            if len(zpoints) != len(points):
                raise web.badrequest(simplejson.dumps({'error': '%s zp != mp %s' % (len(zpoints), len(points))}))

            newglypha = models.Glyph.create(master_id=master.id,
                                            name=glyph.name,
                                            width=glyph.width,
                                            project_id=glyph.project_id)

            i = 0
            for point in points:
                self.create_glyphpoint(newglypha, (i + 1), zpoints[i], point)
                i += 1

        project.masters = ','.join([str(master.id)] * len(project.masters.split(',')))

        glyph = models.Glyph.get(name=postdata.glyphname, master_id=master.id)
        result = self.get_glyphs_jsondata(glyph.name, master)
        return simplejson.dumps({'version': '{0:03d}'.format(master.version),
                                 'master_id': master.id, 'glyphdata': result,
                                 'versions': get_versions(master.project_id)})


LABELS = range(ord('A'), ord('Z') + 1)
METAP_PAIRS = zip(map(chr, LABELS[::2]), map(chr, LABELS[1::2]))


def get_metapolation_label(c):
    """ Return metapolation label pair like AB, CD, EF """
    c = c.upper()
    try:
        index = map(chr, LABELS[::2]).index(c)
        return map(chr, LABELS[::2])[index] + map(chr, LABELS[1::2])[index]
    except ValueError:
        pass

    index = map(chr, LABELS[1::2]).index(c)
    return map(chr, LABELS[::2])[index] + map(chr, LABELS[1::2])[index]


class EditorUploadZIP(app.page, GlyphPageMixin):

    path = '/upload/'

    @raise404_notauthorized
    def POST(self):
        x = web.input(ufofile={}, project_id=0, label='')
        try:
            rawzipcontent = x.ufofile.file.read()
            if not rawzipcontent:
                raise web.badrequest()
            project_id = int(x.project_id)
        except (AttributeError, TypeError, ValueError):
            raise web.badrequest()

        if not project_id:
            projects = models.Project.all()
            count = projects.filter(models.Project.projectname.like('UntitledProject%')).count()
            project = models.Project.create(projectname='UntitledProject%s' % (count + 1),
                                            mfparser=session.get('mfparser'))
        else:
            project = models.Project.get(id=project_id)
            if not project:
                raise web.notfound()

        prepare_environment_directory()

        filename = op.join(project.get_directory(), x.ufofile.filename)
        try:
            with open(filename, 'w') as fp:
                fp.write(rawzipcontent)
        except (IOError, OSError):
            models.Project.delete(project)  # delete created project
            raise web.badrequest()

        try:
            fzip = zipfile.ZipFile(filename)

            namelist = fzip.namelist()

            iscorrect_ufo = False
            ufo_dirs = []
            for f in namelist:
                if re.search(r'.ufo[\\/]$', f):
                    ufo_dirs.append(re.sub(r'[\\/]', '', f))
                if re.search(r'.ufo[\\/]glyphs[\\/].*?.glif$', f, re.IGNORECASE):
                    iscorrect_ufo = True

            if not iscorrect_ufo:
                raise web.badrequest()

            FontNameA = ufo_dirs[0]

            version = models.Master.max(models.Master.version,
                                        project_id=project.id)

            if not version:
                version = 0

            version += 1
            master = models.Master.create(project_id=project.id,
                                          version=version)

            label = get_metapolation_label(x.label)
            metapolation = models.Metapolation.get(label=label, project_id=project.id)
            if not metapolation:
                metapolation = models.Metapolation.create(label=label, project_id=project.id)

            fontpath = master.get_fonts_directory()

            fzip.extractall(fontpath)

            ufopath = master.get_ufo_path()
            shutil.move(op.join(fontpath, FontNameA), ufopath)

            prepare_master_environment(master)

            put_font_all_glyphs(master)
        except (zipfile.BadZipfile, OSError, IOError):
            raise

        index = LABELS.index(ord(x.label.upper()))
        masters = project.masters.split(',')

        if index > len(masters) - 1:
            masters.append(master.id)
        else:
            masters[index] = master.id
        project.masters = ','.join(map(str, masters))
        web.ctx.orm.commit()

        glyph = models.Glyph.filter(master_id=master.id).first()

        masters = project.get_ordered_masters()
        self.set_masters(masters)

        self.initialize(project.projectname, masters[0].version,
                        masters[1].version)

        self.call_metapost_all_glyphs(master, cell='A')
        master_instancelog = project.get_instancelog(master.version, 'a')
        glyphsdata = get_edges_json(master_instancelog, master=master)

        self.call_metapost_all_glyphs(self.get_lft_master())
        instancelog = project.get_instancelog(master.version)
        metaglyphs = get_edges_json(instancelog)
        return simplejson.dumps({'project_id': project.id,
                                 'master_id': master.id,
                                 'glyphname': glyph.name,
                                 'label': x.label,
                                 'metapolation': label,
                                 'glyphs': glyphsdata,
                                 'metaglyphs': metaglyphs,
                                 'version': '{0:03d}'.format(version),
                                 'versions': get_versions(master.project_id)})


class Specimen(app.page):

    path = '/specimen/(\d+)/'

    @raise404_notauthorized
    def GET(self, id):
        """ View single post """
        project = models.Project.get(id=id)
        if not project:
            raise web.notfound()

        web.ctx.project = project
        instances = models.Instance.filter(project_id=project.id)
        return render.specimen(project, instances.order_by(models.Instance.id.desc()))


class GlobalParams(app.page):

    path = '/settings/globals/'

    @raise404_notauthorized
    def GET(self):
        gml = models.GlobalParam.all()
        return render.globals(gml)

    @raise404_notauthorized
    def POST(self):
        # create new one and redirect to edit page
        newid = models.GlobalParam.create()
        raise seeother('/settings/globals/%s' % newid)


class GlobalParam(app.page):

    path = '/settings/globals/([1-9][0-9]{0,})'

    @raise404_notauthorized
    def GET(self, id):
        gm = models.GlobalParam.get(id=id)
        if not gm:
            return web.notfound()

        formg = GlobalParamForm()
        formg.fill(gm.as_dict())

        gml = models.GlobalParam.all()
        return render.globals(gml, formg)

    @raise404_notauthorized
    def POST(self, id):
        gm = models.GlobalParam.get(id=id)
        if not gm:
            return web.notfound()

        formg = GlobalParamForm()
        if formg.validates():
            values = formg.d
            del values['idglobal']
            del values['save']

            models.GlobalParam.update(id=id, values=values)
            return seeother('/settings/globals/')

        gml = models.GlobalParam.all()
        return render.globals(gml, formg)


class LocalParams(app.page):

    path = '/settings/locals/'

    @raise404_notauthorized
    def GET(self):
        localparams = models.LocalParam.all()
        return render.locals(localparams)

    @raise404_notauthorized
    def POST(self):
        localparam = models.LocalParam.create()
        raise seeother('/settings/locals/edit/%s' % localparam.idlocal)


class LocalParam(app.page):

    path = '/settings/locals/edit/(.*)'

    def getform(self, localparam=None):
        form = LocalParamForm()
        if localparam:
            form.fill(localparam.as_dict())
        return form

    @raise404_notauthorized
    def GET(self, id):
        localparam = models.LocalParam.get(id=id)
        if not localparam:
            return web.notfound()

        form = self.getform(localparam)

        glo = models.LocalParam.all()
        return render.editlocals(localparam, glo, form)

    @raise404_notauthorized
    def POST(self, id):
        localparam = models.LocalParam.get(id=id)
        if not localparam:
            return web.notfound()

        form = self.getform()

        if form.validates():
            values = form.d
            del values['save']
            del values['idlocal']

            models.LocalParam.update(id=id, values=values)
            raise seeother('/settings/locals/')

        glo = models.LocalParam.all()
        return render.editlocals(localparam, glo, form)


class logout(app.page):

    path = '/logout'

    def GET(self):
        if is_loggedin():
            session.kill()
        raise web.seeother('/login')


def authorize(user):
    session.authorized = True
    session.user = user.id
    web.ctx.user = user
    return web.seeother("/")


class Login(app.page):
    """ Processes authorization of users with username and password """

    path = '/login'

    def GET(self):
        return render.login(is_loggedin())

    def POST(self):
        name, pwd = web.input().username, web.input().password
        user = models.User.get(username=name)
        if not user:
            return render.login(is_loggedin(), True)

        if bcrypt.verify(pwd, user.password):
            raise authorize(user)
        return render.login(is_loggedin(), True)


def prepare_environment_directory(force=False):
    filelist = ['makefont.sh', 'mf2pt1.mp', 'mf2pt1.pl', 'mf2pt1.texi',
                'mtp.enc']

    static_directory = op.join(working_dir(), 'static')
    if not op.exists(static_directory):
        os.makedirs(static_directory)

    if op.exists(op.join(working_dir(), 'makefont.sh')) and not force:
        return

    for filename in filelist:
        try:
            shutil.copy2(op.join(working_dir(user='skel'), filename),
                         op.join(working_dir()))
        except (OSError, IOError):
            raise


class Register(app.page):
    """ Registration processes of users with username and password """

    path = '/register'

    def GET(self):
        form = RegisterForm()
        return render.register(form, is_loggedin())

    def POST(self):
        form = RegisterForm()
        if not form.validates():
            return render.register(form)

        user = models.User.create(form.d.username, form.d.password, form.d.email)
        seeother = authorize(user)

        prepare_environment_directory()
        raise seeother


def prepare_master_environment(master):
    for f in os.listdir(working_dir('commons', user='skel')):
        filename = working_dir(op.join('commons', f), user='skel')
        try:
            shutil.copy2(filename, master.get_fonts_directory())
        except (IOError, OSError):
            raise
    write_global_param(master.project)
