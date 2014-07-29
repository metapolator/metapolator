Metapolator Docker Files
======================

This repository contains the files needed to run metapolator in a [Docker](http://docker.com) container ([interactive tutorial](https://www.docker.io/gettingstarted/)).

Setup tips
----------

On Debian/Ubuntu, the command is `docker.io` (because of a pre-existing `/usr/bin/docker`) so add an alias

```
alias docker=docker.io
```

to your `.bashrc` or equivalent in order to avoid frustration.

To avoid needing to `sudo` everything, `sudo adduser MYUSER docker` (and don’t forget to log out and back in).

There is an issue with VirtualBox and docker (https://github.com/metapolator/metapolator/issues/100#issuecomment-41560966). To work around it, run:

```
VBoxManage controlvm boot2docker-vm natpf1 "metapolator,tcp,127.0.0.1,8080,,8080"
```

Running Metapolator
-------------------

```
$ docker pull metapolator/metapolator
$ docker run -p 8080:8080 -t metapolator/metapolator
# open in browser http://localhost
```
