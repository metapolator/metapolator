import os
import os.path as op
import shutil

from metapolator.base.config import working_dir


LABELS = range(ord('A'), ord('Z') + 1)


def dopair(pair):
    pair = list(pair)
    if pair[0] is None:
        pair[0] = pair[1]
    if pair[1] is None:
        pair[1] = pair[0]
    return pair


def unifylist(masters):
    p1 = masters[::2]
    p2 = masters[1::2]
    if len(p1) != len(p2):
        p2 += [None] * (len(p1) - len(p2))

    pairs = zip(p1, p2)
    result = []
    for p in map(dopair, pairs):
        if p[0] is not None and p[1] is not None:
            result += p
    return result


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


def prepare_master_environment(master):
    prepare_environment_directory(master.project)
    for f in os.listdir(working_dir('commons', user='skel')):
        filename = working_dir(op.join('commons', f), user='skel')
        try:
            shutil.copy2(filename, master.get_fonts_directory())
        except (IOError, OSError):
            raise


def prepare_environment_directory(project, force=False):
    filelist = ['makefont.sh', 'mf2pt1.mp', 'mf2pt1.pl', 'mf2pt1.texi',
                'mtp.enc']

    projectdir = project.get_master_directory()

    static_directory = op.join(projectdir, 'static')
    if not op.exists(static_directory):
        os.makedirs(static_directory)

    if op.exists(op.join(projectdir, 'makefont.sh')) and not force:
        return

    for filename in filelist:
        try:
            shutil.copy2(op.join(working_dir(user='skel'), filename),
                         op.join(projectdir))
        except (OSError, IOError):
            raise

    import subprocess
    subprocess.Popen(["mpost", "-progname=mpost", "-ini", "mf2pt1", "\\dump"],
                     cwd=projectdir)
