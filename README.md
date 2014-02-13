Metapolator Docker Files
======================

This repository contains the files needed to run metapolator in a Docker container.

> Docker is an open-source project to easily create lightweight, portable, self-sufficient containers from any application. The same container that a developer builds and tests on a laptop can run at scale, in production, on VMs, bare metal, OpenStack clusters, public clouds and more. 

– https://www.docker.io

Running metapolator with Docker is easy:

```
$ sudo docker pull metapolator/metapolator
$ sudo docker run -p 9000:8080 -t metapolator/metapolator
# open in browser http://localhost:9000
```

To learn more about Docker, spend 15 minutes with the [interactive tutorial introduction.](https://www.docker.io/gettingstarted/)
