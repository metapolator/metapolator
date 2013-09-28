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

dirnamea = './fonts/1/MP_akku.ufo/glyphs/'

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

	for ioutline in outline :
	  numout=numout+1
	  print "outline",numout
	  isp = 0
	  itypes=itype 
# first loop
	  for s in ioutline:
	     inum = inum +1
	     if s.get('type') > 0 :
		itype=itype+1
		if isp == 0 : 
		   print "line",inum, "startp"
		   isp=isp+1
		else:
		   print "line",inum
#  second loop
	  isp=0 
	  ir = (itype + 1 - itypes ) /2
	  itype=itypes
	  for s in ioutline:
	    if s.get('type') > 0 :
	      itype=itype+1
	      if isp == 0:
		s.attrib['startp']='1'
		isp=isp+1
	    
	      if itype < itypes+ir+1 :
		zznam=zznam+1
		zznammax=zznam
		zzn = "z"+str(zznam)+"l"
	      else:
		zznam=zznam-1
		zzn = "z"+str(zznam+1)+"r"
	      s.attrib['name']=zzn
	  zznam=zznammax   

	print "glyphsource", glyphsource
	with codecs.open(glyphsource, "w", "utf-8") as out:
		  xmldoc.write(out)
out.close()
#
