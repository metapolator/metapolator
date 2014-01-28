FROM        ubuntu
MAINTAINER  Vitaly Volkov <hash.3g@gmail.com> (@hash3g)

RUN     echo "deb http://mirror.bytemark.co.uk/ubuntu/ precise main restricted universe multiverse" >> /etc/apt/sources.list

RUN     apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        unzip git texlive-metapost mysql-client mysql-server \
        libmysqlclient-dev t1utils libffi-dev libevent-dev \
        libxml2-dev libxslt-dev fontforge python-fontforge \
        build-essential autoconf libtool python-dev \
        python-virtualenv python-setuptools python-pip \
        redis-server

RUN     mkdir -p /usr/local/src/sfnt2woff && cd /usr/local/src/sfnt2woff && wget http://people.mozilla.org/~jkew/woff/woff-code-latest.zip
RUN     cd /usr/local/src/sfnt2woff && make

COPY    /usr/local/src/sfnt2woff/sfnt2woff /usr/local/bin/

copy    buildapp        /usr/local/bin/metap-build
copy    runapp        /usr/local/bin/metap-run