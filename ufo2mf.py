# Metapolator
# Beta 0.1
# (c) 2013 by Simon Egli, Walter Egli, Wei Huang 
#
# http://github.com/metapolator
#
# GPL v3 (http://www.gnu.org/copyleft/gpl.html). 

from xml.dom import minidom
import sys

dirnamef1 = sys.argv[2]
dirnamef2 = sys.argv[3]

charname = sys.argv[1]

font_a =  dirnamef1 +"/"+charname 
font_b =  dirnamef2 +"/"+charname 

print """% File parsed with Metapolator %

% box dimension definition %
"""
glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('advance') 

w = itemlist[0].attributes['width'].value
w = str(float(w)/100)

glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('advance') 

w2 = itemlist[0].attributes['width'].value
w2 = str(float(w2)/100)

glyph = glif.getElementsByTagName('glyph')
g = glyph[0].attributes['name'].value 

uni = minidom.parse(font_a) 
itemlist = uni.getElementsByTagName('unicode')
u = itemlist[0].attributes['hex'].value



print 'beginfontchar(' + g + ', ((' + w + '*A_width + metapolation * (' + w2 + '*B_width - ' + w + '*A_width)) + spacing_' + g + "R) * width_" +  g  + ", 0, 0 );"
# print """if known ps_output:
# glyph_name "uni""" + u + """"; 
# fi
# """

# reading l and r as pxl and pxr font A

print """ 
% point coordinates font A
"""

glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
for item in itemlist :
  for i in range (0,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       x = str(float(x)/100)
       y = str(float(y)/100)
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :
           print "px" + znamer[1:] + " := " + x + "u ; "   +  "py"+ znamer[1:] + " := " + y + "u ;"   
         if im.value.find(znamel)>-1 :
           print "px" + znamel[1:] + " := " + x + "u ; "   +  "py"+ znamel[1:] + " := " + y + "u ;"   



# reading mid points Font A

glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

print """
% reading mid points font A
""" 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :
        
                print ".5(px"+ znamel[1:] + " + px" + znamer[1:] + ") = x2" + zname[1:-1] +"0;"   
                print ".5(py"+ znamel[1:] + " + py" + znamer[1:] + ") = y2" + zname[1:-1] +"0;"   


# reading fake 100 l and r points Font A

glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

print """
% fake extra l an r for metafont
""" 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

   
     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :

                print "px"+ znamel[1:] + " = x"+ znamel[1:-1] + "Bl; py"+ znamel[1:] + " = y"+ znamel[1:-1] + "Bl; " 
                print "px"+ znamer[1:] + " = x"+ znamer[1:-1] + "Br; py"+ znamer[1:] + " = y"+ znamer[1:-1] + "Br; " 



# reading pen widhts Font A

glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

print """
% pen width
""" 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

     
     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :

                print "dist"+ znamel[1:-1] + " := length (z"+ znamel[1:-1] + "Bl-" + "z"+ znamel[1:-1] + "Br) ;" 

# reading l and r as ppxl and ppxr font B

print """ 
% point coordinates font B
"""


glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       x = str(float(x)/100)
       y = str(float(y)/100)
       im =item.attributes['name'] 
       ipn = 1   

     except : 
       inattr=inattr+1 

     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :
           print "ppx" + znamer[1:] + " := " + x + "u ; "   +  "ppy"+ znamer[1:] + " := " + y + "u ;"   
         if im.value.find(znamel)>-1 :
           print "ppx" + znamel[1:] + " := " + x + "u ; "   +  "ppy"+ znamel[1:] + " := " + y + "u ;"   




# reading mid points Font B

glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 

print """
% reading mid points font B
""" 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

    
     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :

                print ".5(ppx"+ znamel[1:] + " + ppx" + znamer[1:] + ") = x2" + zname[1:-1] +"A;"   
                print ".5(ppy"+ znamel[1:] + " + ppy" + znamer[1:] + ") = y2" + zname[1:-1] +"A;"   



# reading fake 100 l and r points Font B

glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 

print """
% fake extra l an r for font B
""" 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

    
     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :
         
                print "ppx"+ znamel[1:] + " = x"+ znamel[1:-1] + "Cl; ppy"+ znamel[1:] + " = y"+ znamel[1:-1] + "Cl; " 
                print "ppx"+ znamer[1:] + " = x"+ znamer[1:-1] + "Cr; ppy"+ znamer[1:] + " = y"+ znamer[1:-1] + "Cr; " 





# reading pen widhts Font B

glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 

print """
% pen width Font B
""" 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

     
     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :

                print "dist"+ znamel[1:-1] + "B := length (z"+ znamel[1:-1] + "Cl-" + "z"+ znamel[1:-1] + "Cr) ;" 
                





# reading pen angle Font A

glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

print """
% pen angle Font A
""" 

inattr=0   
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     zname = 'z'+str(i)+'r'

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       ipn = 1   
     except : 
       inattr=inattr+1 

    
     if ipn == 1 :
       if im.value.find(znamer)>-1 or im.value.find(znamel)>-1: 
         if im.value.find(znamer)>-1 :

                print "ang"+ znamel[1:-1] + " := angle((" + znamel[0:-1] + "Br + (metapolation * (" + znamel[0:-1] + "Cr -" + znamel[0:-1] + "Br))) - (" + znamel[0:-1] + "Bl + (metapolation * (" + znamel[0:-1] + "Cl -" + znamel[0:-1] + "Bl))));" 


# reading extra pen angle Font B 

print """

% test extra pen angle
""" 


glyph = glif.getElementsByTagName('glyph')
g = glyph[0].attributes['name'].value



glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
ivn = 0
stre = " ... "
strtwo = " .. "
stline = " -- "
strz = ""
zzn = []
startp = []
startpval = []

# create empty variable list

angle = []
angleval_B = []


# add iteration to string

for i in range (1,100):
  startp.append("")
  startpval.append(0)

  angle.append("")
  angleval_B.append(0)




# search for parameter values
  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     
     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       try :
	 istartp = item.attributes['startp'].value   
	 istartp = True
       except :
       	 istartp = False

       try :
	 iangle = item.attributes['angle'].value   
	 iangle = True
       except :
       	 iangle = False




       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:

         if istartp == True :
           istartpval = item.attributes['startp'].value
           del startp[i-1]
           startp.insert(i-1,"startp")
	   del startpval[i-1]
           startpval.insert(i-1,istartpval)

         if iangle == True :
           iangleval = item.attributes['angle'].value
           del angle[i-1]
           angle.insert(i-1,"angle")
	   del angleval_B[i-1]
           angleval_B.insert(i-1,iangleval)



# reading extra pen angle 

print """

% test extra pen angle
""" 


glyph = glif.getElementsByTagName('glyph')
g = glyph[0].attributes['name'].value



glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
ivn = 0
stre = " ... "
strtwo = " .. "
stline = " -- "
strz = ""
zzn = []
startp = []
startpval = []

# create empty variable list

angle = []
angleval = []


# add iteration to string

for i in range (1,100):
  startp.append("")
  startpval.append(0)

  angle.append("")
  angleval.append(0)




# search for parameter values
  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     
     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 
       try :
	 istartp = item.attributes['startp'].value   
	 istartp = True
       except :
       	 istartp = False

       try :
	 iangle = item.attributes['angle'].value   
	 iangle = True
       except :
       	 iangle = False




       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:

         if istartp == True :
           istartpval = item.attributes['startp'].value
           del startp[i-1]
           startp.insert(i-1,"startp")
	   del startpval[i-1]
           startpval.insert(i-1,istartpval)

         if iangle == True :
           iangleval = item.attributes['angle'].value
           del angle[i-1]
           angle.insert(i-1,"angle")
	   del angleval[i-1]
           angleval.insert(i-1,iangleval)




nnz = 0
for zitem in zzn :
  nnz = nnz +1 


i = 0
zzn.sort()
zeile =""
zeileend =""
semi = ");"
for i in range (0,nnz) :
  zitem = zzn[i]
  
  zitemb = zzn[i]
  zitemc = zzn[i-1]

## default string

  zeile = ""


# parameters 

  if angle[i] <> "" :
     zeile = zeile + "ang" + str(zitem) + " := ang" + str(zitem) + "  " + str(angleval[i]) + "+ (metapolation * (" + str(angleval_B[i]) + " - " + str(angleval[i]) +" ));" 
  
  else :
     zeile = zeile + "ang" + str(zitem) + " := ang" + str(zitem) + ";"
  zeile = zeile
  print zeile
  

####### new penpos


# reading font Pen Positions Font B


glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 



inattr=0   
ivn = 0
strz = ""
zzn = []


# create empty variable list

penwidth = []
penwidthval = []
B_penwidthval = []


# add iteration to string

for i in range (1,100):

  penwidth.append("")
  penwidthval.append(0)
  B_penwidthval.append(0)


# search for parameter values
  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     
     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 

       try :
	 ipenwidth = item.attributes['penwidth'].value   
	 ipenwidth = True
       except :
       	 ipenwidth = False


       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:

         if ipenwidth == True :
           ipenwidthval = item.attributes['penwidth'].value
           del penwidth[i-1]
           penwidth.insert(i-1,"penwidth")
	   del B_penwidthval[i-1]
           B_penwidthval.insert(i-1,ipenwidthval)





        
# reading font Pen Positions Font B

glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
ivn = 0
strz = ""
zzn = []

# create empty variable list


penwidth = []
penwidthval = []
B_penwidthval = []


# add iteration to string

for i in range (1,100):

  penwidth.append("")
  penwidthval.append(0)
  B_penwidthval.append(0)



# search for parameter values
  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     
     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 


       try :
	 ipenwidth = item.attributes['penwidth'].value   
	 ipenwidth = True
       except :
       	 ipenwidth = False


       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:

         if ipenwidth == True :
           ipenwidthval = item.attributes['penwidth'].value
           del penwidth[i-1]
           penwidth.insert(i-1,"penwidth")
	   del B_penwidthval[i-1]
           B_penwidthval.insert(i-1,ipenwidthval)




        
# reading font Pen Positions Font A

print """

% test new penpos
""" 

glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 



inattr=0   
ivn = 0
strz = ""
zzn = []

# create empty variable list

stemcutter = []
stemcutterval = []


inktrap_l = []
inktrap_lval = []


inktrap_r = []
inktrap_rval = []


penwidth = []
penwidthval = []
A_penwidthval = []


# add iteration to string

for i in range (1,100):

  stemcutter.append("")
  stemcutterval.append(0)

  inktrap_l.append("")
  inktrap_lval.append(0)

  inktrap_r.append("")
  inktrap_rval.append(0)

  penwidth.append("")
  penwidthval.append(0)
  A_penwidthval.append(0)



# search for parameter values
  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     
     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 

       try :
	 istemcutter = item.attributes['stemcutter'].value   
	 istemcutter = True
       except :
       	 istemcutter = False

       try :
	 iinktrap_l = item.attributes['inktrap_l'].value   
	 iinktrap_l = True
       except :
       	 iinktrap_l = False

       try :
	 iinktrap_r = item.attributes['inktrap_r'].value   
	 iinktrap_r = True
       except :
       	 iinktrap_r = False

       try :
	 ipenwidth = item.attributes['penwidth'].value   
	 ipenwidth = True
       except :
       	 ipenwidth = False


       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:

         if istemcutter == True :
           istemcutterval = item.attributes['stemcutter'].value
           del stemcutter[i-1]
           stemcutter.insert(i-1,"stemcutter")
	   del stemcutterval[i-1]
           stemcutterval.insert(i-1,istemcutterval)

         if iinktrap_l == True :
           iinktrap_lval = item.attributes['inktrap_l'].value
           del inktrap_l[i-1]
           inktrap_l.insert(i-1,"inktrap_l")
	   del inktrap_lval[i-1]
           inktrap_lval.insert(i-1,iinktrap_lval)

         if iinktrap_r == True :
           iinktrap_rval = item.attributes['inktrap_r'].value
           del inktrap_r[i-1]
           inktrap_r.insert(i-1,"inktrapcut")
	   del inktrap_rval[i-1]
           inktrap_rval.insert(i-1,iinktrap_rval)

         if ipenwidth == True :
           ipenwidthval = item.attributes['penwidth'].value
           del penwidth[i-1]
           penwidth.insert(i-1,"penwidth")
	   del A_penwidthval[i-1]
           A_penwidthval.insert(i-1,ipenwidthval)

nnz = 0
for zitem in zzn :
  nnz = nnz +1 


i = 0
zzn.sort()
zeile =""
zeileend =""
semi = ";"
close = ")"
for i in range (0,nnz) :
  zitem = zzn[i]
  
  zitemb = zzn[i]
  zitemc = zzn[i-1]

## default string

  zeile =""

#  zeile = """penpos"""  +str(zitem) + "(dist" +str(zitem) + " + ((A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * dist" +str(zitem) + "))"


#  zeile = """penpos""" + znamel[1:-1] + "(dist" + znamel[1:-1] + " + (metapolation * (px - (dist"+znamel[1:-1] + " + (distV * (dist" + znamel[1:-1] + "V - dist" +znamel[1:-1] + "))))), (ang"+znamel[1:-1] + " + (angV * (ang" + znamel[1:-1] + "V - ang" + znamel[1:-1] +"))));"


# parameters 
  
  if penwidth[i] <> "" :
    zeile = zeile +"""penpos"""  +str(zitem) + "((" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + ")) * " + "(dist" +str(zitem) + " + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * dist" +str(zitem) + "))"
  else :
    zeile = zeile + """penpos"""  +str(zitem) + "(dist" +str(zitem) + " + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * dist" +str(zitem) + ")"

#    zeile = zeile + " * (" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + "))"
#    zeile = zeile + " * (" + str(A_penwidthval[i]) +")"

  if stemcutter[i] <> "" :
    zeile = zeile + "-" + stemcutter[i] + "(" +  str(stemcutterval[i]) + ")"      
 
  if inktrap_l[i] <> "" :
    zeile = zeile + "- inktrapcut (" +  str(inktrap_lval[i]) + ")"      
 
  if inktrap_r[i] <> "" :
    zeile = zeile + "- inktrapcut (" +  str(inktrap_rval[i]) + ")"      

#   if angleval[i] <> "" :
#     zeile = zeile + ",ang" + str(angleval[i]) + ");"      
#      
  else: 
    zeile = zeile 
  zeile = zeile + ", ang" +str(zitem) + ");"
  print zeile

#zeile = zeileend + semi

#print zeile
 









        
# reading font Pen strokes

print """

% test new center (z) points
""" 


glyph = glif.getElementsByTagName('glyph')
g = glyph[0].attributes['name'].value


mean = ['13','14','26','29','65','67','69','77','78','79','82','83','85','86','87','88','90','94','95','12','27','63','71','80','81','89','2','7','11','28','30','62','64','66','68','70','72','73','75','76','84','4','8','9','15','59','60','61','74','91','92','93']
#des = ['12','27','63','71','80','81','89']
#asc = ['2','7','11','28','30','62','64','66','68','70','72','73','75','76','84']
cap = ['1','3','5','6','10','16','17','18','19','20','21','22','23','24','25','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58']
#box = ['4','8','9','15','59','60','61','74','91','92','93']

ggroup=""
gggroup=""

if g in mean :
    ggroup = 'xheight'
    gggroup = 'mean'

#if g in des :
#    ggroup = 'descender'
        
if g in cap : 
    ggroup = 'capital'
    gggroup = 'cap'

#if g in asc :
#    ggroup = 'ascender'

#if g in box :
#    ggroup = 'boxheight'


glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
ivn = 0
stre = " ... "
strtwo = " .. "
stline = " -- "
strz = ""
zzn = []
startp = []
startpval = []

# create empty variable list


pointshifted= []
pointshiftedval= []

pointshiftedy = []
pointshiftedyval = []

v = []
vval = []

h = []
hval = []

overx = []
overxval = []

overbase = []
overbaseval = []

overcap = []
overcapval = []



inktrap_l = []
inktrap_lval = []


inktrap_r = []
inktrap_rval = []

stemshift = []
stemshiftval = []

ascpoint = []
ascpointval = []

descpoint = []
descpointval = []







# add iteration to string

for i in range (1,100):
  startp.append("")
  startpval.append(0)
  
  pointshifted.append("")
  pointshiftedval.append(0)

  pointshiftedy.append("")
  pointshiftedyval.append(0)


  v.append("")
  vval.append(0)

  h.append("")
  hval.append(0)

  overx.append("")
  overxval.append(0)

  overbase.append("")
  overbaseval.append(0)

  overcap.append("")
  overcapval.append(0)

  inktrap_l.append("")
  inktrap_lval.append(0)

  inktrap_r.append("")
  inktrap_rval.append(0)

  stemshift.append("")
  stemshiftval.append(0)

  ascpoint.append("")
  ascpointval.append(0)

  descpoint.append("")
  descpointval.append(0)




# search for parameter values
  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     
     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 

       try :
	 ipointshifted = item.attributes['pointshifted'].value   
	 ipointshifted = True
       except :
       	 ipointshifted = False

       try :
	 ipointshiftedy = item.attributes['pointshiftedy'].value   
	 ipointshiftedy = True
       except :
       	 ipointshiftedy = False

       try :
	 istartp = item.attributes['startp'].value   
	 istartp = True
       except :
       	 istartp = False


       try :
	 iv = item.attributes['v'].value   
	 iv = True
       except :
       	 iv = False

       try :
	 ih = item.attributes['h'].value   
	 ih = True
       except :
       	 ih = False

       try :
	 ioverx = item.attributes['overx'].value   
	 ioverx = True
       except :
       	 ioverx = False

       try :
	 ioverbase = item.attributes['overbase'].value   
	 ioverbase = True
       except :
       	 ioverbase = False

       try :
	 iovercap = item.attributes['overcap'].value   
	 iovercap = True
       except :
       	 iovercap = False

       try :
	 iinktrap_l = item.attributes['inktrap_l'].value   
	 iinktrap_l = True
       except :
       	 iinktrap_l = False

       try :
	 iinktrap_r = item.attributes['inktrap_r'].value   
	 iinktrap_r = True
       except :
       	 iinktrap_r = False

       try :
	 istemshift = item.attributes['stemshift'].value   
	 istemshift = True
       except :
       	 istemshift = False

       try :
	 iascpoint = item.attributes['ascpoint'].value   
	 iascpoint = True
       except :
       	 iascpoint = False

       try :
	 idescpoint = item.attributes['descpoint'].value   
	 idescpoint = True
       except :
       	 idescpoint = False



       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:
#         if im.value.find("startp") >-1 :
#           del startp[i-1]
#           startp.insert(i-1,"")
         if istartp == True :
           istartpval = item.attributes['startp'].value
           del startp[i-1]
           startp.insert(i-1,"startp")
	   del startpval[i-1]
           startpval.insert(i-1,istartpval)

         if ipointshifted== True :
           ipointshiftedval= item.attributes['pointshifted'].value
           del pointshifted[i-1]
           pointshifted.insert(i-1,"shifted")
	   del pointshiftedval[i-1]
           pointshiftedval.insert(i-1,ipointshiftedval)

         if ipointshiftedy == True :
           ipointshiftedyval = item.attributes['pointshiftedy'].value
           del pointshiftedy[i-1]
           pointshiftedy.insert(i-1,"shifted")
	   del pointshiftedyval[i-1]
           pointshiftedyval.insert(i-1,ipointshiftedyval)

         if iv == True :
           ivval = item.attributes['v'].value
           del v[i-1]
           v.insert(i-1,"v")
	   del vval[i-1]
           vval.insert(i-1,ivval)

         if ih == True :
           ihval = item.attributes['h'].value
           del h[i-1]
           h.insert(i-1,"h")
	   del hval[i-1]
           hval.insert(i-1,ihval)

         if ioverx == True :
           ioverxval = item.attributes['overx'].value
	   del overx[i-1]
           overx.insert(i-1,"shifted")
	   del overxval[i-1]
           overxval.insert(i-1,ioverxval)

         if ioverbase == True :
           ioverbaseval = item.attributes['overbase'].value
	   del overbase[i-1]
           overbase.insert(i-1,"shifted")
	   del overbaseval[i-1]
           overbaseval.insert(i-1,ioverbaseval)

         if iovercap == True :
           iovercapval = item.attributes['overcap'].value
	   del overcap[i-1]
           overcap.insert(i-1,"shifted")
	   del overcapval[i-1]
           overcapval.insert(i-1,iovercapval)

         if iinktrap_l == True :
           iinktrap_lval = item.attributes['inktrap_l'].value
           del inktrap_l[i-1]
           inktrap_l.insert(i-1,"inktrapcut")
	   del inktrap_lval[i-1]
           inktrap_lval.insert(i-1,iinktrap_lval)

         if iinktrap_r == True :
           iinktrap_rval = item.attributes['inktrap_r'].value
           del inktrap_r[i-1]
           inktrap_r.insert(i-1,"inktrapcut")
	   del inktrap_rval[i-1]
           inktrap_rval.insert(i-1,iinktrap_rval)

         if istemshift == True :
           istemshiftval = item.attributes['stemshift'].value
           del stemshift[i-1]
           stemshift.insert(i-1,"stemshift")
	   del stemshiftval[i-1]
           stemshiftval.insert(i-1,istemshiftval)

         if iascpoint == True :
           iascpointval = item.attributes['ascpoint'].value
           del ascpoint[i-1]
           ascpoint.insert(i-1,"ascpoint")
	   del ascpointval[i-1]
           ascpointval.insert(i-1,iascpointval)

         if idescpoint == True :
           idescpointval = item.attributes['descpoint'].value
           del descpoint[i-1]
           descpoint.insert(i-1,"descpoint")
	   del descpointval[i-1]
           descpointval.insert(i-1,idescpointval)



nnz = 0
for zitem in zzn :
  nnz = nnz +1 


i = 0
zzn.sort()
zeile =""
zeileend =""
semi = ";"
close = ")"
for i in range (0,nnz) :
  zitem = zzn[i]
  
  zitemb = zzn[i]
  zitemc = zzn[i-1]

## default string

  zeile =""

#  zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (A_" + ggroup + " + metapolation * (B_" + ggroup + " - A_" + ggroup + "))*(y2"+str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0)))"

#  if overcap[i] <> "":
 
#     zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_capital + metapolation * (B_capital - A_capital)) / A_cap#) )"

#  else :

#  zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_xheight + metapolation * (B_xheight - A_xheight)) / mean#))"


  if ascpoint[i] <> "" :

     zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_ascender + metapolation * (B_ascender - A_ascender)) / asc#))"

  if descpoint[i] <> "" :

     zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_descender + metapolation * (B_descender - A_descender)) / desc#))"

  else :
  
     zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_" + ggroup + " + metapolation * (B_" +ggroup + " - A_" + ggroup + ")) / " + gggroup + "#))"



#  zeileend =""
#  zeileend = 'z'+str(zzn[nnz-1])+ "=(x2"+ str(zzn[nnz-1])+ "0 *width *width_" + g + " + (metapolation * (x2"+str(zzn[nnz-1])+"A - x2" +str(zzn[nnz-1])+"0)), y2"+str(zzn[nnz-1])+ "0 *" + ggroup + " + (metapolation * (y2"+str(zzn[nnz-1]) + "A - y2" +str(zzn[nnz-1])+ "0)))"
 

# parameters 
  if pointshifted[i] <> "" :
      zeile = zeile +" shifted (" + str(pointshiftedval[i]) + ")"       


  if stemshift[i] <> "" :
      zeile = zeile +" stemshift (" + str(stemshiftval[i]) + ")"       


  if inktrap_l[i] <> "" :
      zeile = zeile +" inktrap_l (" + str(inktrap_lval[i]) + ")"       


  if inktrap_r[i] <> "" :
      zeile = zeile +" inktrap_r (" + str(inktrap_rval[i]) + ")"       

 
  else: 
     zeile = zeile 
  zeile = zeile + semi 
  print zeile

#zeile = zeileend + semi

#print zeile
 



# reading values functions font B


glif = minidom.parse(font_b)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
ivn = 0
stre = " ... "
strtwo = " .. "
stline = " -- "
strz = ""
zzn = []

startp = []
startpval = []

doubledash = []
doubledashvalB = []

tripledash = []
tripledashvalB = []

tension = []
tensionB = []
tensionvalB = []

tensionand = []
tensionandB = []
tensionandvalB = []
tensionandval2B = []

superright = []
superrightvalB = []

superleft = []
superleftvalB = []

dir = []
dirB = []
dirvalB = []

dir2 = []
dir2B = []
dir2valB = []

leftp = []
leftpvalB = []

rightp = []
rightpvalB = []

upp = []
uppvalB = []

downp = []
downpvalB = []

penshiftedy = []
penshiftedyvalB = []

penshifted = []
penshiftedvalB = []

for i in range (1,100):

  startp.append("")
  startpval.append(0)

  doubledash.append("")
  doubledashvalB.append(0)

  tripledash.append("")
  tripledashvalB.append(0)

  tension.append("")
  tensionB.append("")
  tensionvalB.append(0)
  
  tensionand.append("")
  tensionandB.append("")
  tensionandvalB.append(0)
  tensionandval2B.append(0)

  superright.append("")
  superrightvalB.append(0)
  
  superleft.append("")
  superleftvalB.append(0)
  
  dir.append("")
  dirB.append("")
  dirvalB.append(0)

  dir2.append("")
  dir2B.append("")
  dir2valB.append(0)


  leftp.append("")
  leftpvalB.append(0)

  rightp.append("")
  rightpvalB.append(0)

  upp.append("")
  uppvalB.append(0)

  downp.append("")
  downpvalB.append(0)
  
  penshiftedy.append("")
  penshiftedyvalB.append(0)

  penshifted.append("")
  penshiftedvalB.append(0)


  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 


       try :
	 idoubledash = item.attributes['doubledash'].value   
	 idoubledash = True
       except :
       	 idoubledash = False

       try :
	 itripledash = item.attributes['tripledash'].value   
	 itripledash = True
       except :
       	 itripledash = False

       try :
	 idir = item.attributes['dir'].value   
	 idir = True
       except :
       	 idir = False

       try :
	 idir2 = item.attributes['dir2'].value   
	 idir2 = True
       except :
       	 idir2 = False

       try :
	 ileftp = item.attributes['leftp'].value   
	 ileftp = True
       except :
       	 ileftp = False

       try :
	 iupp = item.attributes['upp'].value   
	 iupp = True
       except :
       	 iupp = False

       try :
	 irightp = item.attributes['rightp'].value   
	 irightp = True
       except :
       	 irightp = False

       try :
	 idownp = item.attributes['downp'].value   
	 idownp = True
       except :
       	 idownp = False

       try :
	 itension = item.attributes['tension'].value   
	 itension = True
       except :
       	 itension = False

       try :
	 itensionand = item.attributes['tensionand'].value   
	 itensionand = True

       except :
       	 itensionand = False

       try :
	 isuperright = item.attributes['superright'].value   
	 isuperright = True
       except :
       	 isuperright = False

       try :
	 isuperleft = item.attributes['superleft'].value   
	 isuperleft = True
       except :
       	 isuperleft = False

       try :
	 ipenshifted = item.attributes['penshifted'].value   
	 ipenshifted = True
       except :
       	 ipenshifted = False

       try :
	 ipenshiftedy = item.attributes['penshiftedy'].value   
	 ipenshiftedy = True
       except :
       	 ipenshiftedy = False


       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:
#         if im.value.find("startp") >-1 :
#           del zzstartp[i-1]
#           zzstartp.insert(i-1,"penstroke ")
             
         if idoubledash == True :
           idoubledashval = item.attributes['doubledash'].value
           del doubledash[i-1]
           doubledash.insert(i-1,"doubledash")
	   del doubledashvalB[i-1]
           doubledashvalB.insert(i-1,idoubledashval)

         if itripledash == True :
           itripledashval = item.attributes['tripledash'].value
           del tripledash[i-1]
           tripledash.insert(i-1," ---")
	   del tripledashvalB[i-1]
           tripledashvalB.insert(i-1,itripledashval)

         if idir == True :
           idirval = item.attributes['dir'].value
           del dir[i-1]
           dirB.insert(i-1,"dir")
	   del dirvalB[i-1]
           dirvalB.insert(i-1,idirval)

         if idir2 == True :
           idir2val = item.attributes['dir2'].value
           del dir2[i-1]
           dir2B.insert(i-1,"dir")
	   del dir2valB[i-1]
           dir2valB.insert(i-1,idir2val)
      
         if iupp == True :
           iuppval = item.attributes['upp'].value
           del upp[i-1]
           upp.insert(i-1,"up")
	   del uppvalB[i-1]
           uppvalB.insert(i-1,iuppval)

         if ileftp == True :
           ileftpval = item.attributes['leftp'].value
           del leftp[i-1]
           leftp.insert(i-1,"left")
	   del leftpvalB[i-1]
           leftpvalB.insert(i-1,ileftpval)

         if irightp == True :
           irightpval = item.attributes['rightp'].value
           del rightp[i-1]
           rightp.insert(i-1,"right")
	   del rightpvalB[i-1]
           rightpvalB.insert(i-1,irightpval)

         if idownp == True :
           idownpval = item.attributes['downp'].value
           del downp[i-1]
           downp.insert(i-1,"down")
	   del downpvalB[i-1]
           downpvalB.insert(i-1,idownpval)
                  
         if itension == True :
           itensionval = item.attributes['tension'].value
           del tension[i-1]
           tensionB.insert(i-1,"tension")
	   del tensionvalB[i-1]
           tensionvalB.insert(i-1,itensionval)

         if itensionand == True :
           itensionandval = item.attributes['tensionand'].value
           del tensionand[i-1]
           tensionandB.insert(i-1,"tensionand")
	   del tensionandvalB[i-1]
           del tensionandval2B[i-1]
           tensionandvalB.insert(i-1,itensionandval[:3])
           tensionandval2B.insert(i-1,itensionandval[-3:])

         if isuperright == True :
           isuperrightval = item.attributes['superright'].value
           del superright[i-1]
           superright.insert(i-1,"superright")
	   del superrightvalB[i-1]
           superrightvalB.insert(i-1,isuperrightval)

         if isuperleft == True :
           isuperleftval = item.attributes['superleft'].value
           del superleft[i-1]
           superleft.insert(i-1,"superleft")
	   del superleftvalB[i-1]
           superleftvalB.insert(i-1,isuperleftval)

         if idir == True :
           idirval = item.attributes['dir'].value
           del dir[i-1]
           dir.insert(i-1,"dir")
	   del dirvalB[i-1]
           dirvalB.insert(i-1,idirval)

         if ipenshifted == True :
           ipenshiftedval = item.attributes['penshifted'].value
           del penshifted[i-1]
           penshifted.insert(i-1,"shifted")
	   del penshiftedvalB[i-1]
           penshiftedvalB.insert(i-1,ipenshiftedval)

         if ipenshiftedy == True :
           ipenshiftedyval = item.attributes['penshiftedy'].value
           del penshiftedy[i-1]
           penshiftedy.insert(i-1,"shifted")
	   del penshiftedyvalB[i-1]
           penshiftedyvalB.insert(i-1,ipenshiftedyval)



print """
% penstrokes
"""
           
# reading font penstrokes


glif = minidom.parse(font_a)
itemlist = glif.getElementsByTagName('point') 

inattr=0   
ivn = 0
stre = " ... "
tripledash = "---"
strtwo = " .. "
stline = " -- "
strz = ""
zzn = []
startp = []
startpval = []

doubledash = []
doubledashval = []

tripledash = []
tripledashval = []

tension = []
tensionval = []

tensionand = []
tensionandval = []
tensionandval2 = []

superright = []
superrightval = []

superleft = []
superleftval = []

dir = []
dirval = []

leftp = []
leftpval = []

rightp = []
rightpval = []

upp = []
uppval = []

downp = []
downpval = []

dir2 = []
dir2val = []

leftp2 = []
leftp2val = []

rightp2 = []
rightp2val = []

upp2 = []
upp2val = []

downp2= []
downp2val = []

penshiftedy = []
penshiftedyval = []

penshifted = []
penshiftedval = []

overx = []
overxval = []

overbase = []
overbaseval = []

overcap = []
overcapval = []


overasc = []
overascval = []


overdesc = []
overdescval = []


cycle = []
cycleval = []

for i in range (1,100):

  startp.append("")
  startpval.append(0)

  doubledash.append("")
  doubledashval.append(0)

  tripledash.append("")
  tripledashval.append(0)

  tension.append("")
  tensionval.append(0)
  
  tensionand.append("")
  tensionandval.append(0)
  tensionandval2.append(0)

  superright.append("")
  superrightval.append(0)
  
  superleft.append("")
  superleftval.append(0)
  
  dir.append("")
  dirval.append(0)

  leftp.append("")
  leftpval.append(0)

  rightp.append("")
  rightpval.append(0)

  upp.append("")
  uppval.append(0)

  downp.append("")
  downpval.append(0)

  dir2.append("")
  dir2val.append(0)

  leftp2.append("")
  leftp2val.append(0)

  rightp2.append("")
  rightp2val.append(0)

  upp2.append("")
  upp2val.append(0)
  
  downp2.append("")
  downp2val.append(0)

  penshiftedy.append("")
  penshiftedyval.append(0)

  penshifted.append("")
  penshiftedval.append(0)

  overx.append("")
  overxval.append(0)

  overbase.append("")
  overbaseval.append(0)

  overcap.append("")
  overcapval.append(0)


  overasc.append("")
  overascval.append(0)


  overdesc.append("")
  overdescval.append(0)

  cycle.append("")
  cycleval.append(0)






  
for item in itemlist :
  for i in range (1,100):
     znamel = 'z'+str(i)+'l'
     znamer = 'z'+str(i)+'r'
     

     ipn=0
     try :
       x = item.attributes['x'].value
       y = item.attributes['y'].value
       im =item.attributes['name'] 


       try :
	 istartp = item.attributes['startp'].value   
	 istartp = True
       except :
       	 istartp = False

       try :
	 idoubledash = item.attributes['doubledash'].value   
	 idoubledash = True
       except :
       	 idoubledash = False

       try :
	 itripledash = item.attributes['tripledash'].value   
	 itripledash = True
       except :
       	 itripledash = False

       try :
	 idir = item.attributes['dir'].value   
	 idir = True
       except :
       	 idir = False

       try :
	 idir2 = item.attributes['dir2'].value   
	 idir2 = True
       except :
       	 idir2 = False

       try :
	 ileftp = item.attributes['leftp'].value   
	 ileftp = True
       except :
       	 ileftp = False

       try :
	 ileftp2 = item.attributes['leftp2'].value   
	 ileftp2 = True
       except :
       	 ileftp2 = False

       try :
	 iupp = item.attributes['upp'].value   
	 iupp = True
       except :
       	 iupp = False

       try :
	 iupp2 = item.attributes['upp2'].value   
	 iupp2 = True
       except :
       	 iupp2 = False

       try :
	 irightp = item.attributes['rightp'].value   
	 irightp = True
       except :
       	 irightp = False

       try :
	 irightp2 = item.attributes['rightp2'].value   
	 irightp2 = True
       except :
       	 irightp2 = False

       try :
	 idownp = item.attributes['downp'].value   
	 idownp = True
       except :
       	 idownp = False

       try :
	 idownp2= item.attributes['downp2'].value   
	 idownp2= True
       except :
       	 idownp2= False


       try :
	 itension = item.attributes['tension'].value   
	 itension = True
       except :
       	 itension = False

       try :
	 itensionand = item.attributes['tensionand'].value   
	 itensionand = True
       except :
       	 itensionand = False

       try :
	 isuperright = item.attributes['superright'].value   
	 isuperright = True
       except :
       	 isuperright = False

       try :
	 isuperleft = item.attributes['superleft'].value   
	 isuperleft = True
       except :
       	 isuperleft = False

       try :
	 ipenshifted = item.attributes['penshifted'].value   
	 ipenshifted = True
       except :
       	 ipenshifted = False

       try :
	 ipenshiftedy = item.attributes['penshiftedy'].value   
	 ipenshiftedy = True
       except :
       	 ipenshiftedy = False

       try :
	 ioverx = item.attributes['overx'].value   
	 ioverx = True
       except :
       	 ioverx = False

       try :
	 ioverbase = item.attributes['overbase'].value   
	 ioverbase = True
       except :
       	 ioverbase = False

       try :
	 iovercap = item.attributes['overcap'].value   
	 iovercap = True
       except :
       	 iovercap = False

       try :
	 ioverasc = item.attributes['overasc'].value   
	 ioverasc = True
       except :
       	 ioverasc = False

       try :
	 ioverdesc = item.attributes['overdesc'].value   
	 ioverdesc = True
       except :
       	 ioverdesc = False

       try :
	 icycle = item.attributes['cycle'].value   
	 icycle = True
       except :
       	 icycle = False






       ipn = 1   
     except : 
       inattr=inattr+1 


     if ipn == 1 :
       if im.value.find(znamel) > -1 :
          zzn.append (i)
       if im.value.find(znamel) > -1 or im.value.find(znamer) > -1:
        
#	 if im.value.find("startp") >-1 :
#           del zzstartp[i-1]
#           zzstartp.insert(i-1,"penstroke ")

         if istartp == True :
           istartpval = item.attributes['startp'].value
           del startp[i-1]
           startp.insert(i-1,"penstroke ")
	   del startpval[i-1]
           startpval.insert(i-1,istartpval)
  
         if icycle == True :
           icycleval = item.attributes['cycle'].value
           del cycle[i-1]
           cycle.insert(i-1,"cycle")
	   del cycleval[i-1]
           cycleval.insert(i-1,icycleval)
               
         if idoubledash == True :
           idoubledashval = item.attributes['doubledash'].value
           del doubledash[i-1]
           doubledash.insert(i-1," -- ")
	   del doubledashval[i-1]
           doubledashval.insert(i-1,idoubledashval)

         if itripledash == True :
           itripledashval = item.attributes['tripledash'].value
           del tripledash[i-1]
           tripledash.insert(i-1," ---")
	   del tripledashval[i-1]
           tripledashval.insert(i-1,itripledashval)

         if idir == True :
           idirval = item.attributes['dir'].value
           del dir[i-1]
           dir.insert(i-1,"dir")
	   del dirval[i-1]
           dirval.insert(i-1,idirval)
      
         if idir2 == True :
           idir2val = item.attributes['dir2'].value
           del dir2[i-1]
           dir2.insert(i-1,"dir")
	   del dir2val[i-1]
           dir2val.insert(i-1,idir2val)
      
         if iupp == True :
           iuppval = item.attributes['upp'].value
           del upp[i-1]
           upp.insert(i-1,"{up} ")
	   del uppval[i-1]
           uppval.insert(i-1,iuppval)

         if ileftp == True :
           ileftpval = item.attributes['leftp'].value
           del leftp[i-1]
           leftp.insert(i-1,"{left} ")
	   del leftpval[i-1]
           leftpval.insert(i-1,ileftpval)

         if irightp == True :
           irightpval = item.attributes['rightp'].value
           del rightp[i-1]
           rightp.insert(i-1,"{right} ")
	   del rightpval[i-1]
           rightpval.insert(i-1,irightpval)

         if idownp == True :
           idownpval = item.attributes['downp'].value
           del downp[i-1]
           downp.insert(i-1," {down} ")
	   del downpval[i-1]
           downpval.insert(i-1,idownpval)

         if idownp2 == True :
           idownp2val = item.attributes['downp2'].value
           del downp2[i-1]
           downp2.insert(i-1," {down} ")
	   del downp2val[i-1]
           downp2val.insert(i-1,idownp2val)

         if iupp2 == True :
           iupp2val = item.attributes['upp2'].value
           del upp2[i-1]
           upp2.insert(i-1,"{up} ")
	   del upp2val[i-1]
           upp2val.insert(i-1,iupp2val)

         if ileftp2 == True :
           ileftp2val = item.attributes['leftp2'].value
           del leftp2[i-1]
           leftp2.insert(i-1,"{left} ")
	   del leftp2val[i-1]
           leftp2val.insert(i-1,ileftp2val)

         if irightp2 == True :
           irightp2val = item.attributes['rightp2'].value
           del rightp2[i-1]
           rightp2.insert(i-1,"{right} ")
	   del rightp2val[i-1]
           rightp2val.insert(i-1,irightp2val)
                  
         if itension == True :
           itensionval = item.attributes['tension'].value
           del tension[i-1]
           tension.insert(i-1,"tension")
	   del tensionval[i-1]
           tensionval.insert(i-1,itensionval)

         if itensionand == True :
           itensionandval = item.attributes['tensionand'].value
           del tensionand[i-1]
           tensionand.insert(i-1,"tensionand")
	   del tensionandval[i-1]
	   del tensionandval2[i-1]
           tensionandval.insert(i-1,itensionandval[:3])
           tensionandval2.insert(i-1,itensionandval[-3:])

         if isuperright == True :
           isuperrightval = item.attributes['superright'].value
           del superright[i-1]
           superright.insert(i-1,"super_qr")
	   del superrightval[i-1]
           superrightval.insert(i-1,isuperrightval)

         if isuperleft == True :
           isuperleftval = item.attributes['superleft'].value
           del superleft[i-1]
           superleft.insert(i-1,"super_ql")
	   del superleftval[i-1]
           superleftval.insert(i-1,isuperleftval)

         if idir == True :
           idirval = item.attributes['dir'].value
           del dir[i-1]
           dir.insert(i-1,"dir")
	   del dirval[i-1]
           dirval.insert(i-1,idirval)

         if ipenshifted == True :
           ipenshiftedval = item.attributes['penshifted'].value
           del penshifted[i-1]
           penshifted.insert(i-1,"shifted")
	   del penshiftedval[i-1]
           penshiftedval.insert(i-1,ipenshiftedval)

         if ipenshiftedy == True :
           ipenshiftedyval = item.attributes['penshiftedy'].value
           del penshiftedy[i-1]
           penshiftedy.insert(i-1,"shifted")
	   del penshiftedyval[i-1]
           penshiftedyval.insert(i-1,ipenshiftedyval)

         if ioverx == True :
           ioverxval = item.attributes['overx'].value
	   del overx[i-1]
           overx.insert(i-1,"shifted")
	   del overxval[i-1]
           overxval.insert(i-1,ioverxval)

         if ioverbase == True :
           ioverbaseval = item.attributes['overbase'].value
	   del overbase[i-1]
           overbase.insert(i-1,"shifted")
	   del overbaseval[i-1]
           overbaseval.insert(i-1,ioverbaseval)

         if iovercap == True :
           iovercapval = item.attributes['overcap'].value
	   del overcap[i-1]
           overcap.insert(i-1,"shifted")
	   del overcapval[i-1]
           overcapval.insert(i-1,iovercapval)

         if ioverasc == True :
           ioverascval = item.attributes['overasc'].value
	   del overasc[i-1]
           overasc.insert(i-1,"shifted")
	   del overascval[i-1]
           overascval.insert(i-1,ioverascval)

         if ioverdesc == True :
           ioverdescval = item.attributes['overdesc'].value
	   del overdesc[i-1]
           overdesc.insert(i-1,"shifted")
	   del overdescval[i-1]
           overdescval.insert(i-1,ioverdescval)









nnz = 0
for zitem in zzn :
  nnz = nnz +1 


i = 0
zzn.sort()
zeile = ""
semi = ";"
zeilestart = ""


  

if tripledash == True :
 dash = " --- "
else :
 dash = " ... "

 
for i in range (0,nnz-1) :
  zitem = zzn[i]
  zitemsuper = zzn[i+1]  
  zitemc = zzn[i-1]

## default string

  zeile =""
  zeile =  str(startp[i]) +  "z"+str(zitem)+"e"  
  zeileb =""
  zeileb = str(startp[i])
  zeilec = ""
  zeilec = str(startp[i]) + "z"+str(zitem)+"e" 
  if startp[i+1]=="" : 
# if startp, add parameters


    dash = " ... "
    if tripledash[i] <> "" :
      dash = " --- "
    else :
      if doubledash[i] <> "" :
        dash = " -- "
      else :
        if tension[i] <> "" :
          dash = ""

        else :
          if tensionand[i] <> "" :
            dash = ""
  
          else :
            if superleft[i] <> "" :
              dash = ""
            else :
              if superright[i] <> "" :
                dash = ""
              else :
                if dir2[i] <> "" :
                  dash = ""

                else :
                  if upp2[i] <> "" :
                    dash = ""

                  else :
                    if downp2[i] <> "" :
                      dash = ""

                    else :
                      if rightp2[i] <> "" :
                        dash = ""

                      else :
                        if leftp2[i] <> "" :
                          dash = ""



    if penshifted[i] <> "" :
      zeile = zeile + " shifted (" + str(penshiftedval[i]) + ")"      

    if overx[i] <> "" :
      zeile = zeile + " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

    if overbase[i] <> "" :
      zeile = zeile + " shifted (0, - " + str(overbaseval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

    if overcap[i] <> "" :
      zeile = zeile + " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

    if overasc[i] <> "" :
      zeile = zeile + " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

    if overdesc[i] <> "" :
      zeile = zeile + " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 


    if penshiftedy[i] <> "" :
      zeile = zeile + " shifted (0, y" + str(penshiftedyval[i]) + ")"      

    if superleft[i] <> "" :
      zeile = zeile + strtwo + superleft[i]+"("+str(zitem)+"e," +str(zitemsuper)+"e, ["+str(superleftval[i]) + '+ (metapolation * (' + str(superleftvalB[i])+ '-' +str(superleftval[i]) + '))])' + strtwo      

    if superright[i] <> "" :
      zeile = zeile + strtwo + superright[i]+"("+str(zitem)+"e," +str(zitemsuper)+"e, ["+str(superrightval[i]) + '+ (metapolation * (' + str(superrightvalB[i])+ '-' +str(superrightval[i]) + '))])' + strtwo      


    if upp[i] <> "" :
      zeile = zeile + "{up}"      

    if downp[i] <> "" :
      zeile = zeile + "{down}"      

    if leftp[i] <> "" :
      zeile = zeile + "{left}"      

    if rightp[i] <> "" :
      zeile = zeile + "{right}"      


    if dir[i] <> "" :
       if dirB[i] <> "" :
          zeile = zeile + " {dir ("+ str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + "))}"      
       else :
          zeile = zeile + " {dir ("+ str(dirval[i]) + " + metapolation * (" + str(dirval[i]) + " - " + str(dirval[i]) + "))}"      

             
## tension and leftp2

    if  (tension[i] <> "" and 
         leftp2[i] <> "") :
            if tensionB[i] <> "" :
              zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{left}"  
            else :
              zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{left}" 

    if  (tensionand[i] <> "" and 
         leftp2[i] <> "") :
            if tensionandB[i] <> "" :
              zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{left}"  
            else :
              zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{left}" 
  
    else :
      if leftp2[i] <> "" :
        zeile = zeile  + ' ... ' + leftp2[i]  

      else :
        zeile = zeile 

           
## tension and rightp2

        if  (tension[i] <> "" and 
             rightp2[i] <> "") :
               if tensionB[i] <> "" :
                  zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{right}"  
               else :
                  zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{right}" 

        if  (tensionand[i] <> "" and 
             rightp2[i] <> "") :
               if tensionandB[i] <> "" :
                  zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{right}"  
               else :
                  zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{right}" 

        else :
          if rightp2[i] <> "" :
            zeile = zeile  + ' ... ' + rightp2[i]  

          else :
            zeile = zeile 

## tension and downp2

            if  (tension[i] <> "" and 
                 downp2[i] <> "") :
                   if tensionB[i] <> "" :
                     zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{down}"  
                   else :
                     zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{down}" 

            if  (tensionand[i] <> "" and 
                 downp2[i] <> "") :
                   if tensionandB[i] <> "" :
                      zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{down}"  
                   else :
                      zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{down}" 


            else :
              if downp2[i] <> "" :
                zeile = zeile  + ' ... ' + downp2[i]  

              else :
                zeile = zeile  

## tension and upp2    
    
                if  (tension[i] <> "" and 
                     upp2[i] <> "") :
                       if tensionB[i] <> "" :
                         zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{up}"  
                       else :
                         zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{up}" 

                if  (tensionand[i] <> "" and 
                     upp2[i] <> "") :
                       if tensionandB[i] <> "" :
                          zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{up}"  
                       else :
                          zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{up}" 


                else :
                  if upp2[i] <> "" :
                    zeile = zeile  + ' ... ' + upp2[i]  

                  else :
                    zeile = zeile  

## tension and dir2 

                    if  (tension[i] <> "" and 
                         dir2[i] <> "") :
                           if tensionB[i] <> "" :
                             zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + " {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"  
                           else :
                             zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + " {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}" 


                    if  (tensionand[i] <> "" and 
                         dir2[i] <> "") :
                           if tensionandB[i] <> "" :
                              zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + " {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"  
                           else :
                              zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + " {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}" 


                    else :
                      if dir2[i] <> "" :
                        zeile = zeile  + " ... {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}" 

                      else :
                         if tension[i] <> "" :
                              if tensionB[i] <> "" :
                                zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo
                              else :
                                zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo

                         else :
                           if  tensionand[i] <> "" : 
                              if tensionandB[i] <> "" :
                                zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo
                              else :
                                zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo
  

 


    zeile = zeile + dash 


    
      
# parameters before a new penpos    (extra semi after else)



  else: 



    if dir[i] <> "" :
       if dirB[i] <> "" :
          zeile = zeile + " {dir ("+ str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + "))}"      
       else :
          zeile = zeile + " {dir ("+ str(dirval[i]) + " + metapolation * (" + str(dirval[i]) + " - " + str(dirval[i]) + "))}"      


    if overx[i] <> "" :
      zeile = zeile + " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

    if overbase[i] <> "" :
      zeile = zeile + " shifted (0, - " + str(overbaseval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

    if overcap[i] <> "" :
      zeile = zeile + " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

    if overasc[i] <> "" :
      zeile = zeile + " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

    if overdesc[i] <> "" :
      zeile = zeile + " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 


    if penshifted[i] <> "" :
      zeile = zeile + " shifted (" + str(penshiftedval[i]) + ")"       

    if  ( tension[i] <> "" and 
          upp2[i] <> "") :
            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{up}" 
    else :
      if upp2[i] <> "" :
        zeile = zeile + dash + "{up}" 

    if  ( tension[i] <> "" and 
          downp2[i] <> "") :
            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{down}" 
    else :
      if downp2[i] <> "" :
        zeile = zeile + dash + "{down}" 

    if  ( tension[i] <> "" and 
          rightp2[i] <> "") :
            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{right}" 
    else :
      if rightp2[i] <> "" :
        zeile = zeile + dash + "{right}" 

    if  ( tension[i] <> "" and 
          leftp2[i] <> "") :
            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{left}" 
    else :
      if leftp2[i] <> "" :
        zeile = zeile + dash + "{left}" 

    if  ( tension[i] <> "" and 
          dir2[i] <> "") :
            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{dir "+ str(dir2val[i]) + "}" 
    else :
      if dir2[i] <> "" :
        zeile = zeile + dash + "{dir "+ str(dir2val[i]) + "}" 

    if  ( tension[i] <> "" and 
          cycle[i] <> "") :
            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "cycle"
    else :
      if  ( tensionand[i] <> "" and 
            cycle[i] <> "") :
            zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "cycle"
      else :
        if cycle[i] <> "" :
          zeile = zeile + dash + "cycle" 

        else :
          if tension[i] <> "" :
            if tensionB[i] <> "" :
              zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  
            else :
              zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo 
 
       
          else :
            if tensionand[i] <> "" :
               zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo


    
    zeile = zeile + semi 
  print zeile


# parameters after final point ( +1 after i )


  zitemb = zzn[i+1]
  zeile = "z"+str(zitemb)+"e" 


if penshifted[i+1] <> "" :
 zeile = zeile + " shifted (" + str(penshiftedval[i+1]) + ")"       



if dir[i+1] <> "" :
       if dirB[i+1] <> "" :
          zeile = zeile + " {dir ("+ str(dirval[i+1]) + " + metapolation * (" + str(dirvalB[i+1]) + " - " + str(dirval[i+1]) + "))}"      
       else :
          zeile = zeile + " {dir ("+ str(dirval[i+1]) + " + metapolation * (" + str(dirval[i+1]) + " - " + str(dirval[i+1]) + "))}"      



if overx[i+1] <> "" :
      zeile = zeile + " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i+1]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

if overbase[i+1] <> "" :
      zeile = zeile + " shifted (0, - " + str(overbaseval[i+1]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

if overcap[i+1] <> "" :
      zeile = zeile + " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i+1]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

if overasc[i+1] <> "" :
      zeile = zeile + " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i+1]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

if overdesc[i+1] <> "" :
      zeile = zeile + " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i+1]) + ") - (0, A_over + metapolation * (B_over - A_over))" 



if  ( tension[i+1] <> "" and 
      upp2[i+1] <> "") :
        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{up}" 

if  ( tension[i+1] <> "" and 
      downp2[i+1] <> "") :
        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{down}" 

if  ( tension[i+1] <> "" and 
      rightp2[i+1] <> "") :
        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{right}" 

if  ( tension[i+1] <> "" and 
      leftp2[i+1] <> "") :
        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{left}" 

if  ( tension[i+1] <> "" and 
      dir2[i+1] <> "") :
        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{dir "+ str(dir2val[i+1]) + "}" 

if upp2[i+1] <> "" :
 zeile = zeile + dash + upp2[i+1]  




else :
  if dir2[i+1] <> "" :
    zeile = zeile + " ... {dir "+ str(dir2val[i+1]) + "}"   
  else :
    if downp2[i+1] <> "" :
      zeile = zeile + dash + downp2[i+1]  
    else :
      if upp2[i+1] <> "" :
        zeile = zeile + dash + upp2[i+1]  
      else :
        if leftp2[i+1] <> "" :
          zeile = zeile + dash  + leftp2[i+1]  
        else :
          if rightp2[i+1] <> "" :
            zeile = zeile + dash + rightp2[i+1]    

          else :
            if tension[i+1] <> "" :
              zeile = zeile + strtwo + "tension" + " (" + tensionval[i+1] + '/100 + (metapolation * (' + tensionvalB[i+1] + '/100-' + tensionval[i+1] + '/100)))' + strtwo  + downp2[i+1] 

            else :
              if  ( tensionand[i+1] <> "" and 
                 cycle[i+1] <> "") :
                 zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i+1]) + '/100) + (metapolation * ((' + str(tensionandvalB[i+1]) + '/100) - (' + str(tensionandval[i+1]) + '/100))))' + " and ((" + str(tensionandval2[i+1]) + '/100) + (metapolation * ((' + str(tensionandval2B[i+1]) + '/100) - (' + str(tensionandval2[i+1]) + '/100))))' + strtwo + "cycle"

              else :
                if cycle[i+1] <> "" :
                  zeile = zeile + dash + cycle[i+1] 


                else :
                   zeile = zeile

# print closing z point

print zeile 
print semi


print """

% pen labels
penlabels(range 1 thru 99);
endchar;
"""
