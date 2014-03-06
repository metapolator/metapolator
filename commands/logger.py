import time


class Logger(object):

    def __init__(self, verbose=False, xml=False, timing=False):
        self.verbose = verbose
        self.xml = xml
        self.timing = timing
        self.last_time = self.start_time = time.time()

    def parse_opts(self, argv):
        argv = argv[:]
        for v in ['verbose', 'xml', 'timing']:
            if "--" + v in argv:
                setattr(self, v, True)
                argv.remove("--" + v)
        return argv

    def __call__(self, *things):
        if not self.verbose:
            return
        print ' '.join(str(x) for x in things)

    def lapse(self, *things):
        if not self.timing:
            return
        new_time = time.time()
        print "Took %0.3fs to %s" % (new_time - self.last_time,
                                     ' '.join(str(x) for x in things))
        self.last_time = new_time


logger = Logger(timing=True)
