FROM        ubuntu:12.04

MAINTAINER  Vitaly Volkov <hash.3g@gmail.com> (@hash3g)

RUN     echo "deb http://mirror.bytemark.co.uk/ubuntu/ precise main restricted universe multiverse" >> /etc/apt/sources.list

RUN     apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        automake unzip git texlive-metapost t1utils libffi-dev libevent-dev \
        libxml2-dev libxslt-dev fontforge python-fontforge \
        build-essential autoconf libtool python-dev \
        python-virtualenv python-setuptools python-pip \
        redis-server wget mysql-server mysql-client libmysqlclient-dev

RUN     /usr/bin/mysql_install_db

CMD     ["sh", "/usr/bin/mysqld_safe"]

RUN     mkdir -p sfnt2woff && cd sfnt2woff && wget http://people.mozilla.org/~jkew/woff/woff-code-latest.zip
RUN     cd sfnt2woff && unzip woff-code-latest.zip && make
RUN     cp sfnt2woff/sfnt2woff /usr/local/bin/

ADD    buildapp        /usr/local/bin/
ADD    runapp        /usr/local/bin/