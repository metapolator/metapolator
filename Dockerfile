FROM        ubuntu:12.04

ENV MYSQLTMPROOT temprootpass

MAINTAINER  Vitaly Volkov <hash.3g@gmail.com> (@hash3g)

RUN     echo "deb http://mirror.bytemark.co.uk/ubuntu/ precise main restricted universe multiverse" >> /etc/apt/sources.list

RUN echo mysql-server mysql-server/root_password password $MYSQLTMPROOT | debconf-set-selections;\
  echo mysql-server mysql-server/root_password_again password $MYSQLTMPROOT | debconf-set-selections;\
  apt-get install -y mysql-server mysql-client libmysqlclient-dev

RUN     apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        automake unzip git texlive-metapost t1utils libffi-dev libevent-dev \
        libxml2-dev libxslt-dev fontforge python-fontforge \
        build-essential autoconf libtool python-dev \
        python-virtualenv python-setuptools python-pip \
        redis-server wget

RUN     mkdir -p sfnt2woff && cd sfnt2woff && wget http://people.mozilla.org/~jkew/woff/woff-code-latest.zip
RUN     cd sfnt2woff && unzip woff-code-latest.zip && make

ADD    sfnt2woff/sfnt2woff /usr/local/bin/

ADD    buildapp        /usr/local/bin/metap-build
ADD    runapp        /usr/local/bin/metap-run