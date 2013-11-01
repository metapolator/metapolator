drop table if exists glyph;
drop table if exists glyphoutline;
drop table if exists glyphparam;
drop table if exists master;
drop table if exists globalparam;
drop table if exists localparam;
drop table if exists groupparam;

CREATE TABLE glyph (
    idglyph INT AUTO_INCREMENT,
    glyphName varchar(3),
    width integer,
    unicode TEXT,
    primary key (idglyph)
);
CREATE TABLE glyphoutline (
    id INT ,
    glyphName VARCHAR(3),
    PointNr VARCHAR(4),
    x integer,
    y integer, 
    contrp integer default 0,
    idmaster INT,
    pip INT,
    vdate    TIMESTAMP default now(),
    fontsource ENUM('A', 'B'),
    primary key (idmaster,id,glyphName,fontsource)
);
CREATE TABLE glyphparam (
    id INT ,
    glyphName VARCHAR(3),
    PointName VARCHAR(5),
    groupname VARCHAR(10),
    startp INT,
    doubledash INT,
    tripledash INT,
    superleft float,
    superright float,
    leftp   INT,
    rightp  INT,
    downp   INT,
    upp     INT,
    dir     varchar(30),
    leftp2   INT,
    rightp2  INT,
    downp2   INT,
    upp2     INT,
    dir2     varchar(30),
    tension	varchar(30),
    tensionand varchar(10),
    cycle     INT,
    penshifted varchar(30), 
    pointshifted varchar(30),
    angle varchar(30), 
    penwidth varchar(30),
    overx VARCHAR(10), 
    overbase VARCHAR(10),  
    overcap VARCHAR(10), 
    overasc VARCHAR(10), 
    overdesc VARCHAR(10), 
    ascpoint INT, 
    descpoint INT, 
    stemcutter VARCHAR(30),
    stemshift VARCHAR(30),
    inktrap_l float,
    inktrap_r float,   
    idmaster INT,
    vdate    TIMESTAMP default now(),
    fontsource ENUM('A', 'B'),
    primary key (idmaster,id,glyphName,fontsource)
);
CREATE TABLE groupparam (
    groupname varchar(10), 
    startp INT,
    doubledash INT,
    tripledash INT,
    superleft float,
    superright float,
    leftp   INT,
    rightp  INT,
    downp   INT,
    upp     INT,
    dir     varchar(30),
    leftp2   INT,
    rightp2  INT,
    downp2   INT,
    upp2     INT,
    dir2     varchar(30),
    tension	varchar(30),
    tensionand varchar(30),
    cycle     INT,
    penshifted varchar(30), 
    pointshifted varchar(30),
    angle varchar(30), 
    penwidth varchar(30),
    overx VARCHAR(10), 
    overbase VARCHAR(10),  
    overcap VARCHAR(10), 
    overasc VARCHAR(10), 
    overdesc VARCHAR(10), 
    ascpoint INT, 
    descpoint INT, 
    stemcutter VARCHAR(30),
    stemshift VARCHAR(30),
    inktrap_l float,
    inktrap_r float,  
    idmaster INT,
    vdate    TIMESTAMP default now(),
    primary key (idmaster, groupname)
);
CREATE TABLE master (
    idmaster INT AUTO_INCREMENT,
    FontName VARCHAR(30) NOT NULL,
    FontNameA varchar(30),
    FontNameB varchar(30),
    idglobal INT, 
    idlocalA INT,
    idlocalB INT,
    vdate    TIMESTAMP default now(),
    primary key (idmaster),
    index idx_name (FontName),
    index idx_idglobal (idglobal),
    index idx_idlocalA (idlocalA),
    index idx_idlocalB (idlocalB)
);
CREATE TABLE globalparam (
    idglobal INT AUTO_INCREMENT PRIMARY KEY,
    metapolation float default 0,
    unitwidth float default 0,
    fontsize  integer default 10,
    mean      float default 5.0,
    cap       float default 8.0,
    ascl       float default 2.0,
    des       float default 2.0,
    box       float default 10
);
CREATE TABLE localparam (
    idlocal INT AUTO_INCREMENT PRIMARY KEY,
    px        float default 0,
    width  float default 1,
	space  float default 0,
    xheight   float default 5.0,
    capital   float default 8.0,
    boxheight   float default 10.0,
    ascender   float default 8.0,
    descender  float default 2.0,
    inktrap    integer default 10,
    stemcut   integer default 20,
    skeleton  float default 0.0,
    superness float default 1.0,
	over float default 0.1
);
insert into master (FontName,FontNameA,FontNameB,idglobal) Values ("Foxtail", "FoxtailA.ufo","FoxtailA.ufo",1);
insert into globalparam (idglobal,metapolation,unitwidth,fontsize) Values (1, 0,1,10);
insert into globalparam (idglobal,metapolation,unitwidth,fontsize) Values (2, 1,1,10);
insert into localparam (idlocal) values (1);
insert into localparam (idlocal) values (2);
insert into localparam (idlocal) values (3);
insert into localparam (idlocal) values (4);
