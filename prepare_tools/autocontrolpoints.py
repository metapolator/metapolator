from lxml import etree
import codecs
import os.path

def buildfname ( filename ):
    try :
      basename,extension = filename.split('.')
    except :
           extension="garbage"
           basename=""
    return [basename,extension]

# UFO directory :

#dirnamea = 'MP_a.ufo/glyphs/'
#dirnamea = 'MPExo-ExtraBold.ufo/glyphs/'
dirnamea = '../commands/fontbox/D.ufo/glyphs/'


charlista = [f for f in os.listdir(dirnamea) ]
for ch1 in charlista :
    fnb,ext=buildfname (ch1)
    if ext in ["glif"]  :

        glyphsource = dirnamea+ch1
        xmldoc = etree.parse(glyphsource)
        outline = xmldoc.find("outline")


        numout=0
        inum = 0
        itype=0
        itypes=0
        zznam=0
        icontrol=0
        icontrols=0


        for ioutline in outline :
            numout=numout+1
            print "outline",numout
            isp = 0
            itypes=itype
            inout = 0
            ns=0
            yyy=[]
            xxx=[]
# zero loop to build xxx and yyy set
            for s in ioutline :
                if s.get('x') <> None:
                    xk = s.get('x')
                    yk = s.get('y')
                    xxx.append(xk)
                    yyy.append(yk)
                else :
                    xk = '0'
                    yk = '0'
                    xxx.append(xk)
                    yyy.append(yk)

            xxx.append(xxx[0])
            yyy.append(yyy[0])

# first loop
            for s in ioutline:
                ns = ns +1
                inum = inum +1
                if s.get('type') > 0 :
                    itype=itype+1
                    if isp == 0 :
                        print "line",inum, "startp"
                        isp=isp+1
                else :
                    if s.get('extra') == "1" :
                       s.attrib['x'] = xxx[ns-2]
                       s.attrib['y'] = yyy[ns-2]
                    if s.get('extra') == "2" :
                       s.attrib['x'] = xxx[ns]
                       s.attrib['y'] = yyy[ns]
                    inout = inout+1
                    if  inout % 2 == 1 :
                       s.attrib['control_out']="1"
                    else :
                       s.attrib['control_in']="1"
#  second loop
            inout = 0
            isp=0
            itype=itypes
            for s in ioutline:
                if s.get('type') <> 0 :
                    itype=itype+1
                    if isp == 0:
                        s.attrib['startp']='1'
                        isp=isp+1

                    if itype < itypes+1 :
                        zznam=zznam+1
                        zzn = "z"+str(zznam)+"r"
                    else:
                        zznam=zznam+1
                        zzn = "z"+str(zznam)+"l"
                        s.attrib['name']=zzn



        print "glyphsource", glyphsource
        with codecs.open(glyphsource, "w", "utf-8") as out:
            xmldoc.write(out)
out.close()
#
