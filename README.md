docker
======


```
$ sudo docker pull metapolator/metapolator
$ sudo docker run -p 8080 -t metapolator/metapolator
# then find what port it binded
$ sudo docker ps -a
--------- 0.0.0.0:49161->8080/tcp --------
# open in browser localhost:49161
```
