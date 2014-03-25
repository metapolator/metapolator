#!/bin/bash
family="fontbox"
fontversion="1"
metafont="fontbox"

while [ "$1" != "" ]; do
    case $1 in
        -f | --family )         shift
                                family=$1
                                ;;
        -fv | --fontversion )   shift
                                fontversion=$1
                                ;;
        * )                     metafont=$1
    esac
    shift
done

rm $1.log
# mf font.mf
perl mf2pt1.pl --encoding=mtp.enc --comment="Copyright (C) 2014." --family="${family}" --nofixedpitch --fullname="${family}" --name=${fontversion} --designsize="10" --rounding="0.1" --weight=Regular $metafont.mf

# sfnt2woff $1.otf && ttf2eot $1.ttf > $1.eot
# sfnt2woff $1.otf > $1.woff

# mv $1.eot static/$1-webfont.eot
# mv $1.woff static/$1-webfont.woff
# mv $1.ttf static/$1-webfont.ttf
mv $1.otf static/$1.otf

rm -rf $1.afm
rm -rf $1.pfb
rm -rf $1.tfm
