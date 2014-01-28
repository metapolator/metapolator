FROM        ubuntu
MAINTAINER  Vitaly Volkov <hash.3g@gmail.com> (@hash3g)

RUN     apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
        unzip git texlive-metapost mysql-client mysql-server \
        libmysqlclient-dev t1utils libffi-dev libevent-dev \
        libxml2-dev libxslt-dev woff-tools fontforge python-fontforge \
        build-essential autoconf libtool python-dev \
        python-virtualenv python-setuptools python-pip \
        redis-server

copy    buildapp        /usr/local/bin/metap-build
copy    runapp        /usr/local/bin/metap-run