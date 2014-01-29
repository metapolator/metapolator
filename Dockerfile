FROM        ubuntu:12.04

MAINTAINER  Vitaly Volkov <hash.3g@gmail.com> (@hash3g)

RUN     echo "deb http://mirror.bytemark.co.uk/ubuntu/ precise main restricted universe multiverse" >> /etc/apt/sources.list

RUN     apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        automake unzip git texlive-metapost t1utils libffi-dev libevent-dev \
        libxml2-dev libxslt-dev fontforge python-fontforge \
        build-essential autoconf libtool python-dev python-pip \
        redis-server wget mysql-server mysql-client libmysqlclient-dev \
        pwgen perl nginx sudo supervisor

RUN     echo %sudo        ALL=NOPASSWD: ALL >> /etc/sudoers

RUN     mkdir -p sfnt2woff && cd sfnt2woff && wget http://people.mozilla.org/~jkew/woff/woff-code-latest.zip
RUN     cd sfnt2woff && unzip woff-code-latest.zip && make
RUN     cp sfnt2woff/sfnt2woff /usr/local/bin/

ADD    supervisord.conf     /etc/supervisor/conf.d/
ADD    runapp               /usr/local/bin/
ADD    nginx.conf           /etc/nginx/sites-enabled/
RUN    chmod 755 /usr/local/bin/runapp

RUN    rm -rf /var/www/
ADD    https://github.com/metapolator/metapolator/archive/master.zip /master.zip
RUN    unzip master.zip
RUN    mkdir -p /var/www/
RUN    cp -R metapolation-master /var/www/metapolation

RUN    mkdir /var/log/supervisor/
RUN    mkdir /var/run/sshd/

EXPOSE  8080

CMD    ["/bin/bash", "/usr/local/bin/runapp"]