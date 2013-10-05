drop view if exists vglyphoutline;
drop view if exists vglyphoutlines;
drop view if exists vgls;
drop view if exists vglgroup;
create  view vglyphoutline as select v.id, v.user_id, v.glyphName,v.PointNr,v.x,v.y,v.contrp,p.PointName, IFNULL(p.groupname,'') groupn, v.idmaster from glyphoutline v left join glyphparam p  on v.pip=p.id and v.glyphName=p.glyphName and v.idmaster=p.idmaster and v.user_id = p.user_id;
create view vglyphoutlines as select v.id, v.user_id, p.idmaster,p.glyphName,PointNr,PointName, IFNULL(p.groupname,'') groupn,startp,doubledash,tripledash,superleft,superright,leftp,rightp,downp,upp,dir,leftp2,rightp2,downp2,upp2,dir2,tension,tensionand,cycle,penshifted,pointshifted,angle,penwidth,overx,overbase,overcap,overasc,overdesc,ascpoint,descpoint,stemcutter,stemshift,inktrap_l,inktrap_r from glyphoutline v left join glyphparam p on v.pip=p.id and p.PointName>'' and v.user_id=p.user_id and v.glyphName=p.glyphName and v.idmaster=p.idmaster;
create view vgls as select v.id,p.idmaster,p.glyphName,PointNr,PointName, v.user_id, 
ifnull(p.startp     ,(select g.startp      from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) startp     ,
ifnull(p.doubledash ,(select g.doubledash  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) doubledash ,
ifnull(p.tripledash ,(select g.tripledash  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) tripledash ,
ifnull(p.superleft ,(select g.superleft  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) superleft ,
ifnull(p.superright ,(select g.superright  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) superright ,
ifnull(p.leftp      ,(select g.leftp       from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) leftp      ,
ifnull(p.rightp     ,(select g.rightp      from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) rightp     ,
ifnull(p.downp      ,(select g.downp       from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) downp      ,
ifnull(p.upp        ,(select g.upp         from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) upp        ,
ifnull(p.dir        ,(select g.dir         from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) dir        ,
ifnull(p.leftp2     ,(select g.leftp2      from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) leftp2     ,
ifnull(p.rightp2    ,(select g.rightp2     from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) rightp2    ,
ifnull(p.downp2     ,(select g.downp2      from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) downp2     ,
ifnull(p.upp2       ,(select g.upp2        from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) upp2       ,
ifnull(p.dir2       ,(select g.dir2        from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) dir2       ,
ifnull(p.tension    ,(select g.tension     from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) tension    ,
ifnull(p.tensionand ,(select g.tensionand  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) tensionand ,
ifnull(p.cycle      ,(select g.cycle       from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) cycle      ,
ifnull(p.penshifted ,(select g.penshifted  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) penshifted ,
ifnull(p.pointshifted ,(select g.pointshifted  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) pointshifted ,
ifnull(p.angle  ,(select g.angle   from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) angle  ,
ifnull(p.penwidth   ,(select g.penwidth    from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) penwidth   ,
ifnull(p.overx      ,(select g.overx       from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) overx      ,
ifnull(p.overbase   ,(select g.overbase    from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) overbase   ,
ifnull(p.overcap    ,(select g.overcap     from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) overcap    ,
ifnull(p.overasc    ,(select g.overasc     from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) overasc    ,
ifnull(p.overdesc   ,(select g.overdesc    from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) overdesc   ,
ifnull(p.ascpoint    ,(select g.ascpoint     from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) ascpoint    ,
ifnull(p.descpoint   ,(select g.descpoint    from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) descpoint   ,
ifnull(p.stemcutter ,(select g.stemcutter  from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) stemcutter ,
ifnull(p.stemshift  ,(select g.stemshift   from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) stemshift  ,
ifnull(p.inktrap_l  ,(select g.inktrap_l   from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) inktrap_l  ,
ifnull(p.inktrap_r  ,(select g.inktrap_r   from groupparam g where g.idmaster=v.idmaster and g.groupname=p.groupname)) inktrap_r  
from glyphoutline v left join glyphparam p on v.pip=p.id and p.PointName>'' and v.glyphName=p.glyphName and v.user_id=p.user_id and v.idmaster=p.idmaster order by p.PointName;
create view vglgroup as select v.id, v.user_id, v.idmaster,v.glyphName,v.groupname,
p.startp,p.doubledash,p.tripledash,p.superleft,p.superright,p.leftp,p.rightp,p.downp,p.upp,p.dir,p.leftp2,p.rightp2,p.downp2,p.upp2,p.dir2,p.tension,p.tensionand,p.cycle,p.penshifted,p.pointshifted,p.angle,p.penwidth,p.overx,p.overbase,p.overcap,p.overasc,p.overdesc,p.ascpoint,p.descpoint,p.stemcutter,p.stemshift,p.inktrap_l,p.inktrap_r from glyphparam v , groupparam p where  p.groupname>'' and v.groupname=p.groupname and v.user_id=p.user_id and v.idmaster=p.idmaster;
