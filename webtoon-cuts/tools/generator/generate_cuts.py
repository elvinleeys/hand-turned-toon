import sys, os, json, random, math
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from lib import *
ROOT=os.environ.get('OUT_DIR','./out')
os.makedirs(ROOT,exist_ok=True)

def page(title,alt,body,d,bg,font=False):
    helm='<style>\nbody{margin:0}\n</style>'
    if font:
        helm='<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&amp;display=swap">\n'+helm
    svg=(f'<svg width="800" height="1200" viewBox="0 0 800 1200" role="img" aria-label="{alt}" '
         f'xmlns="http://www.w3.org/2000/svg" style="display: block">{d.render()}{R(0,0,800,1200,bg)}{"".join(body)}</svg>')
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{helm}
</helmet>
<div style="width: 800px; height: 1200px; overflow: hidden; position: relative; background: {bg}">
{svg}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":800,"height":1200}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''
cuts=[]
RED='#FF3B3B'

# ================= 01 intro =================
d=Defs(); o=[]
o.append(R(0,0,800,1200,'#0A0F14'))
# side walls (stairwell) concrete
lw=d.lg(0,0,260,0,[(0,'#121A22',1),(1,'#1E2934',1)])
rw=d.lg(800,0,540,0,[(0,'#0E151C',1),(1,'#1B2530',1)])
o.append(P('M0 0 L260 300 L260 1060 L0 1200 Z',lw))
o.append(P('M800 0 L540 300 L540 1060 L800 1200 Z',rw))
# back wall
bw=d.lg(400,300,400,1060,[(0,'#2A3846',1),(0.45,'#223040',1),(1,'#121A22',1)])
o.append(R(260,300,280,760,bw))
o.append(mottle(0,0,800,1200,0.8))
o.append(mottle(0,0,800,1200,0.55,'mottle2'))
# ceiling slab
o.append(P('M0 0 L800 0 L540 300 L260 300 Z','#070A0E'))
o.append(L(260,300,540,300,'#3A4A5A',2,'opacity="0.6"'))
# stair railing on left going up-left (we came down)
for i in range(8):
    y=1040-i*95; x=260-i*34
    o.append(P(f'M{x} {y} L{x-34} {y-95} L{x-34} {y-80} L{x} {y+15} Z','#0B1117'))
    o.append(L(x,y,x-34,y-95,'#2E3D4C',2,'opacity="0.7"'))
o.append(PL([(220,780),(30,140)],'#3A4B5C',5)); o.append(PL([(220,786),(30,146)],'#05080B',3))
for i in range(5):
    x=220-i*46; y=780-i*155
    o.append(L(x,y,x,y+120,'#2A3846',4))
# pipes on right wall + hanging cable
o.append(PL([(800,120),(540,360)],'#2B3846',14)); o.append(PL([(800,114),(540,354)],'#4A5C6E',3,'opacity="0.6"'))
o.append(P('M 470 300 C 480 360, 450 380, 456 430',None,'stroke="#06090C" stroke-width="4" fill="none"'))
o.append(drips(1,270,530,300,22,220,'#05080B',0.55))
o.append(drips(2,560,780,200,14,300,'#05080B',0.4))
o.append(cracks(3,300,360,4,120,'#06090C'))
o.append(cracks(4,120,500,3,160,'#06090C'))
# peeling paint patches on left wall
for (x,y,s) in ((90,640,1),(170,420,0.7),(60,880,0.8)):
    o.append(G([P('M0 0 C 20 -10, 50 -4, 60 10 C 50 24, 30 30, 6 24 C -6 16, -6 6, 0 0 Z','#2E3D4C'),P('M0 0 C 20 -10, 50 -4, 60 10',None,'stroke="#506374" stroke-width="2" fill="none"')],f'translate({x} {y}) scale({s})'))
# DOOR
o.append(R(300,470,200,520,'#0B1016'))
dg=d.lg(0,480,0,980,[(0,'#5A6E80',1),(0.18,'#3C4D5E',1),(1,'#1A242E',1)])
o.append(R(312,482,176,508,dg,2))
o.append(R(326,500,148,200,'#000',4,'opacity="0.18"')); o.append(R(326,730,148,240,'#000',4,'opacity="0.18"'))
o.append(f'<rect x="312" y="482" width="176" height="508" filter="url(#rust)" opacity="0.9"></rect>')
for yy in (494,976):
    for xx in (322,478):
        o.append(C(xx,yy,4,'#8DA2B5')); o.append(R(xx-2,yy+4,4,40,'#6A3A1E',2,'opacity="0.5" filter="url(#b3)"'))
o.append(R(448,712,26,46,'#06090C',4)); o.append(C(461,726,4,RED)); o.append(glow(d,461,726,40,RED,0.5))
# bulb + cage + cone
o.append(R(397,404,6,28,'#3C4A58')); o.append(C(400,440,12,'#FFF6DE')); o.append(glow(d,400,440,110,'#E6F0FF',0.55))
o.append(P('M 386 432 C 386 456, 414 456, 414 432',None,'stroke="#1A222A" stroke-width="2" fill="none"'))
o.append(cone(d,400,446,240,560,1080,'#D8E6F5',0.32,30))
o.append(dust(400,446,250,550,1060,'#E8F2FF',70,9))
# floor wet with reflection
fg=d.lg(0,1060,0,1200,[(0,'#141C24',1),(1,'#06090C',1)])
o.append(P('M260 1060 L540 1060 L800 1200 L0 1200 Z',fg))
o.append(E(400,1080,180,20,'#C9DAEC','opacity="0.16" filter="url(#b8)"'))
o.append(R(394,1066,12,120,'#E6F0FF',6,'opacity="0.18" filter="url(#b3)"'))
o.append(rubble(5,250,560,1062,1180,18,['#1A242E','#25313D','#0E151C']))
# HARIN back view
o.append(G(harin_back(d,'#9DB4CB','#0D141B','#22303D','#0A0F14','#2C3B4B','#3A3436','#1E1A1C'),'translate(330 820) scale(1.05)'))
o.append(vignette(d,0.9))
o.append(grain(0.07))
cuts.append(('Main.dc.html','01-intro','지하 연구실 철문 앞에 선 하린. 휴대폰에 도윤의 메시지 &quot;문은 손으로 열어&quot;가 떠 있다.',o,d,'#0A0F14',False))

# ================= 02-05 door =================
def door(stage):
    d=Defs(); o=[]
    o.append(R(0,0,800,1200,'#10171E'))
    wg=d.lg(0,0,0,1200,[(0,'#1A242E',1),(0.4,'#24323F',1),(1,'#0C1218',1)])
    o.append(R(0,0,800,1200,wg))
    # concrete blocks
    for r in range(11):
        y=r*110
        o.append(L(0,y,800,y,'#0A0F14',2,'opacity="0.7"'))
        off=0 if r%2 else 90
        for x in range(off,800,180): o.append(L(x,y,x,y+110,'#0A0F14',2,'opacity="0.7"'))
    o.append(mottle(0,0,800,1200,0.9)); o.append(mottle(0,0,800,1200,0.6,'mottle2'))
    o.append(drips(11,0,160,0,10,600,'#05080B',0.5)); o.append(drips(12,640,800,0,10,600,'#05080B',0.5))
    o.append(cracks(13,90,300,4,180,'#05080B')); o.append(cracks(14,720,820,4,200,'#05080B'))
    # cable dangling
    o.append(P('M 690 0 C 700 120, 660 180, 680 260 C 690 300, 676 330, 684 350',None,'stroke="#04070A" stroke-width="5" fill="none"'))
    o.append(P('M 684 350 L 680 362 M 684 350 L 690 364',None,'stroke="#C88A3A" stroke-width="2" fill="none"'))
    # overhead light fixture top-left
    o.append(R(80,40,160,18,'#2A3642',4)); o.append(R(90,58,140,8,'#E6F0FF')); o.append(glow(d,160,62,160,'#DDEBFF',0.45))
    o.append(cone(d,160,66,-40,520,1100,'#D3E2F2',0.22,60))
    # floor
    o.append(R(0,1080,800,120,'#070B0F'))
    o.append(L(0,1080,800,1080,'#3A4A5A',2,'opacity="0.6"'))
    o.append(rubble(15,0,800,1086,1196,20,['#151E27','#1F2A35','#0B1015']))
    # frame (bent in later stages)
    fr='M150 230 L650 230 L650 1080 L150 1080 Z' if stage<2 else 'M150 230 L650 236 L662 1080 L140 1080 Z'
    fg=d.lg(150,0,650,0,[(0,'#2C3A47',1),(0.5,'#3E4F60',1),(1,'#1C2630',1)])
    o.append(P(fr,fg)); o.append(P(fr,None,'stroke="#000" stroke-width="3" fill="none" opacity="0.6"'))
    o.append(f'<path d="{fr}" filter="url(#rust)" opacity="0.8"></path>')
    if stage==3:
        # broken - corridor beyond
        o.append(R(190,270,420,810,'#020604'))
        cg=d.lg(0,270,0,1080,[(0,'#041008',1),(0.55,'#0C2A17',1),(1,'#071209',1)])
        o.append(P('M190 270 L340 520 L460 520 L610 270 Z','#030805'))
        o.append(P('M190 1080 L340 820 L460 820 L610 1080 Z',cg))
        o.append(P('M190 270 L340 520 L340 820 L190 1080 Z','#06140B'))
        o.append(P('M610 270 L460 520 L460 820 L610 1080 Z','#05110A'))
        o.append(R(340,520,120,300,'#010302'))
        for (x,y,s) in ((250,420,1),(550,420,1),(372,560,0.5),(428,560,0.5)):
            o.append(R(x-18*s,y-6*s,36*s,12*s,'#7DFFB0',3)); o.append(glow(d,x,y,110*s,'#3DDC84',0.55))
        o.append(cone(d,250,430,170,380,1080,'#3DDC84',0.25,10)); o.append(cone(d,550,430,420,640,1080,'#3DDC84',0.25,10))
        o.append(glow(d,400,980,300,'#3DDC84',0.25))
        o.append(dust(400,500,180,620,1080,'#9AF0BE',90,21,2))
        # door slab fallen inward, perspective
        sg=d.lg(0,640,0,1060,[(0,'#56697B',1),(1,'#1A232C',1)])
        o.append(P('M226 712 L534 664 L566 1010 L244 1064 Z',sg))
        o.append(f'<path d="M226 712 L534 664 L566 1010 L244 1064 Z" filter="url(#rust)" opacity="0.9"></path>')
        o.append(P('M226 712 L534 664 L538 690 L230 740 Z','#7E93A6'))
        o.append(cracks(22,380,860,7,170,'#05080B',2.2,0.9))
        o.append(R(470,800,60,90,'#06090C',6,'transform="rotate(-8 500 845)"'))
        # jagged torn metal on frame
        jag='#33424F'
        o.append(P('M190 270 L260 270 L236 350 L276 420 L222 510 L254 600 L208 680 L232 760 L190 820 Z',jag))
        o.append(P('M610 270 L534 270 L572 370 L526 470 L580 560 L546 660 L600 760 L560 860 L596 960 L610 1000 Z',jag))
        o.append(P('M260 270 L236 350 L276 420 L222 510 L254 600 L208 680 L232 760',None,'stroke="#C6D6E6" stroke-width="2.5" fill="none" opacity="0.6"'))
        o.append(P('M534 270 L572 370 L526 470 L580 560 L546 660 L600 760 L560 860 L596 960',None,'stroke="#9AF0BE" stroke-width="2.5" fill="none" opacity="0.55"'))
        # lock torn off, sparks
        o.append(G([R(-30,-50,60,100,'#06090C',6),C(0,26,6,'#3A1A1C')],'translate(600 640) rotate(24)'))
        rnd=random.Random(30)
        for _ in range(16):
            a=rnd.uniform(-2.8,-0.2); l=rnd.uniform(20,70); x=600; y=620
            o.append(L(x,y,x+math.cos(a)*l,y+math.sin(a)*l,'#FFD27A',rnd.uniform(1,2.5),'opacity="0.85"'))
        o.append(glow(d,600,620,60,'#FFB84A',0.6))
        # flying debris
        rnd=random.Random(31)
        for _ in range(26):
            x=rnd.uniform(60,740); y=rnd.uniform(140,1060); s=rnd.uniform(4,14)
            o.append(PG([(x,y),(x+s,y+s*0.3),(x+s*0.4,y+s)],rnd.choice(['#5E7184','#3B4B5B','#8CA2B6'])))
        o.append(specks(32,100,200,700,1000,60,'#C9D8E6',0.6,2.5))
    else:
        dg=d.lg(0,270,0,1080,[(0,'#6A7F92',1),(0.12,'#475A6C',1),(0.6,'#2F3E4C',1),(1,'#161E26',1)])
        o.append(R(190,270,420,810,dg))
        o.append(f'<rect x="190" y="270" width="420" height="810" filter="url(#rust)" opacity="0.95"></rect>')
        o.append(f'<rect x="190" y="270" width="420" height="810" filter="url(#mottle2)" opacity="0.7"></rect>')
        # inset panels with bevel
        for (y,h) in ((310,300),(660,370)):
            o.append(R(232,y,336,h,'#000',6,'opacity="0.22"'))
            o.append(L(232,y+h,568,y+h,'#7F94A8',2,'opacity="0.45"')); o.append(L(568,y,568,y+h,'#7F94A8',2,'opacity="0.35"'))
        # scratches
        rnd=random.Random(40)
        for _ in range(30):
            x=rnd.uniform(200,600); y=rnd.uniform(280,1060); l=rnd.uniform(10,50); a=rnd.uniform(-0.6,0.6)
            o.append(L(x,y,x+math.cos(a)*l,y+math.sin(a)*l,'#A9BCCC',1,'opacity="0.25"'))
        # hazard stripe worn at bottom
        o.append(G([R(190+i*42,1030,22,50,'#C9A23A',0,f'transform="skewX(-30)" opacity="0.45"') for i in range(-2,12)],'', 'clip-path="'+d.clip(R(190,1030,420,50,'#000'))+'"'))
        o.append(f'<rect x="190" y="1030" width="420" height="50" filter="url(#mottle2)" opacity="0.9"></rect>')
        # rivets with rust drips
        for yy in (292,1010):
            for xx in (210,590):
                o.append(C(xx,yy,6,'#9AB0C4')); o.append(C(xx+1,yy+1,6,'#0A0E12','opacity="0.4"'))
                o.append(R(xx-2,yy+6,4,60,'#6A3A1E',2,'opacity="0.55" filter="url(#b3)"'))
        for yy in (370,960): o.append(R(178,yy,18,70,'#5C6F82',3)); o.append(R(178,yy,6,70,'#9AB0C4',3,'opacity="0.5"'))
        # dents from earlier hits on door (subtle)
        o.append(E(300,500,30,20,'#000','opacity="0.15" filter="url(#b8)"'))
        # lock box
        o.append(R(484,606,84,124,'#06090C',10))
        o.append(R(492,614,68,108,'#141B22',8))
        o.append(R(500,622,52,46,'#05080B',4))
        led={0:1,1:0.5,2:0}[stage]
        if led:
            o.append(C(526,694,9,RED,f'opacity="{led}"')); o.append(glow(d,526,694,90,RED,0.55*led))
            o.append(R(500,622,52,46,RED,4,f'opacity="{0.22*led}"'))
            o.append(glow(d,526,680,330,RED,0.16*led))
        else:
            o.append(C(526,694,9,'#2A0F11'))
        crack='#040608'
        if stage>=1:
            o.append(E(400,620,70,50,'#000','opacity="0.35" filter="url(#b8)"'))
            o.append(E(392,606,50,30,'#9AB0C4','opacity="0.18" filter="url(#b8)"'))
            o.append(PL([(400,600),(388,622),(408,640),(396,668)],crack,5))
            o.append(PL([(400,600),(420,588),(436,596)],crack,4))
            o.append(PL([(408,640),(430,650)],crack,3))
            o.append(PL([(401,602),(389,624),(409,642)],'#C6D6E6',1.2,'opacity="0.6" transform="translate(2 -2)"'))
            o.append(specks(41,340,560,470,680,26,'#C9D8E6',0.8,3))
            o.append(E(400,620,110,80,'#B8C8D8','opacity="0.12" filter="url(#b18)"'))
        if stage>=2:
            o.append(E(400,632,120,90,'#000','opacity="0.35" filter="url(#b18)"'))
            for pts in ([(396,668),(370,720),(388,790),(360,880),(372,1000)],
                        [(408,640),(470,630),(520,560),(590,520)],
                        [(400,600),(350,560),(330,480),(270,420)],
                        [(388,622),(320,640),(250,700),(220,760)],
                        [(420,588),(450,500),(440,400),(470,310)],
                        [(388,790),(440,840),(500,900),(560,1000)],
                        [(370,720),(300,770),(240,860)]):
                o.append(PL(pts,crack,4))
                o.append(PL([(x+2,y-2) for x,y in pts],'#C6D6E6',1.2,'opacity="0.45"'))
            o.append(PL([(350,560),(388,622),(370,720)],crack,3)); o.append(PL([(450,500),(470,630),(440,840)],crack,3))
            o.append(PL([(300,600),(330,700),(388,790),(470,760),(500,640),(450,500),(350,560),(300,600)],crack,2.5))
            for pts in ([(504,626),(528,646),(548,628)],[(528,646),(520,664)],[(528,646),(550,662)]):
                o.append(PL(pts,'#C6D6E6',2))
            o.append(specks(42,300,500,520,780,50,'#C9D8E6',0.85,3.5))
            o.append(E(400,640,190,140,'#B8C8D8','opacity="0.12" filter="url(#b18)"'))
    # FIST (first person)
    o.append(G(fist(d,'#B8A49A','#7E6A62','#3C302E','#151C24','#3A4856',RED if stage<2 else ('#9AB0C4' if stage==2 else '#3DDC84'),0.75 if stage<2 else 0.55),'translate(420 1086) scale(0.92)'))
    o.append(vignette(d,0.85,400,640,760))
    o.append(grain(0.07))
    return d,o

for st,(fn,nm,alt) in enumerate([('02-door-locked.dc.html','02-door-locked','붉은 잠금등이 켜진 두꺼운 철문. 굳게 잠겨 있다.'),
                                  ('03-door-crack1.dc.html','03-door-crack1','철문 가운데에 금이 갔다.'),
                                  ('04-door-crack2.dc.html','04-door-crack2','금이 문 전체로 퍼지고 잠금장치가 깨졌다.'),
                                  ('05-door-broken.dc.html','05-door-broken','철문이 부서져 열리고, 녹색 비상등이 켜진 복도가 보인다.')]):
    d,o=door(st); cuts.append((fn,nm,alt,o,d,'#10171E',False))

# ================= corridor helper =================
GL='#3DDC84'; GL2='#A6F5C6'
def corridor(d,o,vx,vy,ew,eh,seed,end_dark=True):
    x0,x1=vx-ew/2,vx+ew/2; y0,y1=vy-eh/2,vy+eh/2
    o.append(R(0,0,800,1200,'#050B07'))
    o.append(P(f'M0 0 L800 0 L{x1} {y0} L{x0} {y0} Z','#030704'))
    flg=d.lg(0,1200,0,y1,[(0,'#10261A',1),(1,'#07120B',1)])
    o.append(P(f'M0 1200 L800 1200 L{x1} {y1} L{x0} {y1} Z',flg))
    wl=d.lg(0,0,x0,0,[(0,'#0E2116',1),(1,'#0A170F',1)])
    o.append(P(f'M0 0 L{x0} {y0} L{x0} {y1} L0 1200 Z',wl))
    wr=d.lg(800,0,x1,0,[(0,'#0C1D13',1),(1,'#09150E',1)])
    o.append(P(f'M800 0 L{x1} {y0} L{x1} {y1} L800 1200 Z',wr))
    o.append(R(x0,y0,ew,eh,'#020503' if end_dark else '#0A1A10'))
    o.append(mottle(0,0,800,1200,0.85)); o.append(mottle(0,0,800,1200,0.6,'mottle2'))
    # wainscot line on walls
    for t in (0.62,):
        o.append(L(0,1200*t*0+760,x0,y0+(y1-y0)*0.62,'#1E3A28',4,'opacity="0.7"'))
        o.append(L(800,760,x1,y0+(y1-y0)*0.62,'#1E3A28',4,'opacity="0.7"'))
    # door frames on walls
    for t in (0.35,0.7):
        xl=x0*t; xr=800-(800-x1)*t
        tl=y0*t+0*(1-t); bl=1200-(1200-y1)*t
        o.append(P(f'M{xl:.0f} {tl+ (bl-tl)*0.25:.0f} L{xl+ (x0-xl)*0.35:.0f} {tl+(bl-tl)*0.3:.0f} L{xl+(x0-xl)*0.35:.0f} {bl-(bl-y1)*0.35:.0f} L{xl:.0f} {bl:.0f} Z','#030805','opacity="0.85"'))
    # ceiling lights (some dead), floor tiles
    for t in (0.25,0.5,0.75):
        yy=y1+(1200-y1)*(1-t)**2; xl=x0-x0*(1-t)**2; xr=x1+(800-x1)*(1-t)**2
        o.append(L(xl,yy,xr,yy,'#1C3828',2,'opacity="0.7"'))
    rnd=random.Random(seed)
    for i,t in enumerate((0.18,0.45,0.72)):
        lx=x0*t; ly=y0*t+260*(1-t)
        sz=56*(1-t)+12
        on = i!=1
        for side,xx in (('l',lx),('r',800-(800-x1)*t)):
            o.append(R(xx-sz/2,ly,sz,sz*0.38,GL2 if on else '#163020',3))
            if on:
                o.append(glow(d,xx,ly+sz*0.2,sz*3.4,GL,0.5))
                o.append(cone(d,xx,ly+sz*0.4,xx-sz*2.6,xx+sz*2.6,ly+sz*9,GL,0.18,sz*0.2))
    # pipes along ceiling edges
    o.append(L(0,70,x0,y0+8,'#14291C',12)); o.append(L(0,64,x0,y0+4,'#2C5139',2,'opacity="0.6"'))
    o.append(L(800,70,x1,y0+8,'#14291C',12)); o.append(L(800,64,x1,y0+4,'#2C5139',2,'opacity="0.6"'))
    # hanging cables
    o.append(P(f'M 260 {y0*0.45:.0f} C 280 240, 230 300, 250 360',None,'stroke="#010302" stroke-width="3" fill="none"'))
    o.append(P(f'M 540 {y0*0.4:.0f} C 560 200, 520 260, 548 320 C 556 340, 548 360, 552 372',None,'stroke="#010302" stroke-width="3" fill="none"'))
    # fallen ceiling panel hanging
    o.append(PG([(560,40),(700,110),(670,130),(540,64)],'#0F2216')); o.append(L(560,40,700,110,'#2C5139',2,'opacity="0.6"'))
    o.append(drips(seed+1,20,x0,80,10,300,'#000',0.6)); o.append(drips(seed+2,x1,780,80,10,300,'#000',0.6))
    o.append(cracks(seed+3,120,400,4,160,'#000')); o.append(cracks(seed+4,700,560,4,160,'#000'))
    # puddles reflecting green
    o.append(E(320,1100,120,14,GL2,'opacity="0.12" filter="url(#b3)"'))
    o.append(E(520,980,70,8,GL2,'opacity="0.10" filter="url(#b3)"'))
    o.append(rubble(seed+5,40,760,y1+20,1190,26,['#0B1A10','#132A1B','#06100A']))
    # scattered papers
    rnd=random.Random(seed+6)
    for _ in range(7):
        x=rnd.uniform(80,720); y=rnd.uniform(y1+60,1180); s=rnd.uniform(14,34)*(y/1200)
        o.append(G(R(-s,-s*0.7,s*2,s*1.4,'#9BB8A6',1,'opacity="0.55"'),f'translate({x:.0f} {y:.0f}) rotate({rnd.uniform(-40,40):.0f}) scale(1 0.5)'))
    # haze toward end
    o.append(glow(d,vx,vy,ew*1.5,'#2C7A4B',0.35))
    return x0,y0,x1,y1

# ================= 06 =================
d=Defs(); o=[]
corridor(d,o,400,560,130,180,60)
# overturned chair silhouette
o.append(G([R(0,0,90,10,'#040905'),R(0,10,10,60,'#040905'),R(80,10,10,60,'#040905'),R(-10,-60,10,70,'#040905'),R(-10,-60,60,10,'#040905')],'translate(130 820) rotate(-14)'))
o.append(L(140,818,220,800,'#2C5139',2,'opacity="0.6"'))
# ID card foreground with light
o.append(E(440,1040,150,40,'#000','opacity="0.6" filter="url(#b8)"'))
card=[R(-72,-48,144,96,'#D7E6DC',10), R(-72,-48,144,22,'#2F6B4A',10), R(-72,-34,144,8,'#2F6B4A'),
      R(-58,-18,42,52,'#5E7F6C',4), C(-37,0,11,'#8FAE9B'), P('M -54 34 C -50 18, -24 18, -20 34 Z','#8FAE9B'),
      R(-6,-14,64,8,'#5E7F6C',4), R(-6,2,48,6,'#9AB3A4',3), R(-6,16,56,6,'#9AB3A4',3), R(30,28,30,10,'#2F6B4A',2),
      R(-72,-48,144,96,'#000',10,'opacity="0.0"')]
o.append(G(card,'translate(440 1020) rotate(-14) skewX(-12) scale(1.05 0.62)'))
o.append(G([R(-72,-48,144,96,'#000',10)],'translate(440 1020) rotate(-14) skewX(-12) scale(1.05 0.62)','opacity="0.0"'))
o.append(f'<g transform="translate(440 1020) rotate(-14) skewX(-12) scale(1.05 0.62)" filter="url(#mottle2)" opacity="0.6"><rect x="-72" y="-48" width="144" height="96" rx="10"></rect></g>')
o.append(P('M 400 990 C 380 940, 320 920, 280 950 C 250 980, 260 1060, 220 1110',None,'stroke="#174A2D" stroke-width="6" fill="none"'))
o.append(P('M 400 990 C 380 940, 320 920, 280 950',None,'stroke="#5BC98A" stroke-width="1.5" fill="none" opacity="0.6"'))
o.append(R(392,980,18,14,'#7A8A80',3))
o.append(glow(d,440,1010,150,GL,0.18))
o.append(P('M 380 990 L 512 966',None,'stroke="#EAFBF0" stroke-width="2" opacity="0.7"'))
o.append(vignette(d,0.92))
o.append(grain(0.08))
cuts.append(('06-hall-start.dc.html','06-hall-start','녹색 비상등이 비추는 긴 복도. 바닥에 도윤의 사원증이 떨어져 있다.',o,d,'#050B07',False))

# ================= 07 =================
d=Defs(); o=[]
wg=d.lg(0,0,0,1200,[(0,'#07120B',1),(0.35,'#163024',1),(0.8,'#0D1E14',1),(1,'#050B07',1)])
o.append(R(0,0,800,1200,wg))
# tiles lower half, plaster upper
for r in range(7):
    y=640+r*60
    o.append(L(0,y,800,y,'#06100A',2,'opacity="0.8"'))
    for x in range((r%2)*40,800,80): o.append(L(x,y,x,y+60,'#06100A',2,'opacity="0.8"'))
o.append(L(0,640,800,640,'#2C5139',4,'opacity="0.7"'))
o.append(mottle(0,0,800,1200,0.85)); o.append(mottle(0,0,800,1200,0.7,'mottle2'))
# broken tiles
for (x,y) in ((80,700),(160,760),(480,820),(640,700)):
    o.append(R(x,y,80,60,'#030805','opacity="0.75"'))
    o.append(cracks(x+y,x+40,y+30,3,60,'#000'))
o.append(drips(70,0,800,120,26,420,'#000',0.6))
o.append(cracks(71,300,300,5,220,'#000')); o.append(cracks(72,620,200,4,180,'#000'))
# peeling plaster
for (x,y,s) in ((60,180,1.4),(520,420,1.1),(260,560,0.9)):
    o.append(G([P('M0 0 C 30 -16, 70 -6, 84 14 C 70 34, 40 40, 8 32 C -8 22, -8 8, 0 0 Z','#08140C'),P('M0 0 C 30 -16, 70 -6, 84 14',None,'stroke="#3E6E50" stroke-width="2" fill="none"')],f'translate({x} {y}) scale({s})'))
# emergency lamp top
o.append(R(340,60,120,34,'#0B1A10',6)); o.append(R(350,70,100,16,GL2,4))
o.append(glow(d,400,80,260,GL,0.55))
o.append(cone(d,400,90,40,760,1200,GL,0.22,50))
o.append(dust(400,90,60,740,1100,'#C8FADB',80,73))
# chalk drawings
CH='#E4F5EA'
def chalk_arrow(x,y,s):
    g=[]
    for k,(dx,dy) in enumerate(((0,0),(1.5,1),(-1,1.5))):
        op=0.85 if k==0 else 0.35
        g.append(PL([(124+dx,dy),(0+dx,4+dy)],CH,6 if k==0 else 3,f'opacity="{op}" stroke-dasharray="{"" if k==0 else "14 6"}"'))
        g.append(PL([(38+dx,-30+dy),(0+dx,2+dy),(40+dx,32+dy)],CH,6 if k==0 else 3,f'opacity="{op}"'))
    return G(g,f'translate({x} {y}) scale({s}) rotate({random.Random(x).uniform(-4,4):.1f})')
for (x,y,s,hx,hs) in ((70,250,1.0,270,74),(300,380,1.2,520,84),(60,500,0.9,240,64),(360,560,1.0,560,70)):
    o.append(G(chalk_arrow(x,y,s),'', 'filter="url(#b3)" opacity="0.35"'))
    o.append(chalk_arrow(x,y,s))
    o.append(hand_sketch(hx,y+24,5,hs,CH,5,'none','opacity="0.9"'))
    o.append(E(hx,y+10,50,40,CH,'opacity="0.06" filter="url(#b8)"'))
o.append(specks(74,40,200,640,640,90,CH,0.5,1.6))
# Harin over shoulder right foreground (green rim)
o.append(G(harin_back(d,'#8EF0B5','#030805','#0F2418','#020503','#1C3A28','#2A3A30','#101A14',phone=False),'translate(690 760) scale(1.9) rotate(-6)'))
o.append(vignette(d,0.9))
o.append(grain(0.08))
cuts.append(('07-hall-arrows.dc.html','07-hall-arrows','벽에 손바닥 그림과 왼쪽을 가리키는 화살표가 분필로 그려져 있다.',o,d,'#07120B',False))

# ================= 08 =================
d=Defs(); o=[]
x0,y0,x1,y1=corridor(d,o,400,640,440,600,80,False)
endw=d.lg(0,y0,0,y1,[(0,'#0A1A10',1),(1,'#060F09',1)])
o.append(R(x0,y0,440,600,endw)); o.append(mottle(x0,y0,440,600,0.9))
o.append(drips(81,x0,x1,y0,12,260,'#000',0.6))
# door frame and half-open leaf
o.append(R(250,450,300,490,'#183526')); o.append(R(250,450,300,490,None,0,'stroke="#000" stroke-width="3" fill="none"'))
o.append(R(266,466,268,474,'#000'))
lf=d.lg(266,0,430,0,[(0,'#2C5139',1),(1,'#10261A',1)])
o.append(P('M266 466 L430 486 L430 920 L266 940 Z',lf))
o.append(f'<path d="M266 466 L430 486 L430 920 L266 940 Z" filter="url(#mottle2)" opacity="0.8"></path>')
o.append(P('M430 486 L438 488 L438 918 L430 920 Z','#5BC98A','opacity="0.6"'))
o.append(C(410,700,7,'#5BC98A')); o.append(R(296,520,100,130,'#000',4,'opacity="0.25"'))
# sign LAB 3, dirty
o.append(R(334,386,132,46,'#B9CFC0',4)); o.append(f'<rect x="334" y="386" width="132" height="46" filter="url(#mottle2)" opacity="0.9"></rect>')
o.append('<text x="400" y="418" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" fill="#10261A" letter-spacing="3">LAB 3</text>')
o.append(L(338,392,350,428,'#000',1.5,'opacity="0.4"'))
# lamp above door flickering
o.append(R(374,346,52,18,GL2,4)); o.append(glow(d,400,356,180,GL,0.6))
o.append(cone(d,400,364,230,570,1040,GL,0.25,20))
o.append(dust(400,364,240,560,1000,'#C8FADB',60,82))
# loose warning tape
o.append(P('M 250 560 C 300 600, 360 610, 420 640',None,'stroke="#C9A23A" stroke-width="10" fill="none" opacity="0.75"'))
o.append(P('M 550 540 C 560 600, 556 660, 540 720',None,'stroke="#C9A23A" stroke-width="10" fill="none" opacity="0.6"'))
# black void gradient spilling
o.append(P('M430 920 L534 940 L640 1200 L380 1200 Z','#000','opacity="0.45" filter="url(#b8)"'))
o.append(vignette(d,0.92))
o.append(grain(0.08))
cuts.append(('08-hall-door.dc.html','08-hall-door','복도 끝, 반쯤 열린 실험실 문. 안은 깜깜하다.',o,d,'#050B07',False))

# ================= 09 lab (lit) =================
d=Defs(); o=[]
Y='#F5C84C'; PAPER='#ECEEE6'
wg=d.lg(0,0,0,1200,[(0,'#1E2533',1),(0.3,'#3A475B',1),(0.65,'#2E394B',1),(1,'#141A24',1)])
o.append(R(0,0,800,1200,wg))
o.append(mottle(0,0,800,1200,0.55)); o.append(mottle(0,0,800,1200,0.4,'mottle2'))
o.append(R(0,0,800,140,'#11161F'))
for x in (130,400,670):
    o.append(R(x-60,118,120,14,'#56657D',4)); o.append(R(x-56,132,112,6,'#FFF1C2'))
    o.append(glow(d,x,140,200,'#FFE8A8',0.35))
    o.append(cone(d,x,140,x-200,x+200,800,'#FFE8A8',0.12,40))
o.append(drips(90,0,800,140,18,200,'#0B0F16',0.45))
# whiteboard A (160,300)
o.append(R(36,196,248,208,'#5A6880',6)); o.append(R(48,208,224,184,PAPER,4))
o.append(R(48,208,224,184,'#000',4,'opacity="0.06"'))
o.append(f'<rect x="48" y="208" width="224" height="184" filter="url(#mottle2)" opacity="0.35"></rect>')
o.append(P('M 60 230 C 120 250, 180 228, 250 246',None,'stroke="#A9B4C2" stroke-width="2" fill="none" opacity="0.6"'))
o.append(hand_sketch(130,322,3,86,'#26324A',5))
o.append('<text x="200" y="304" font-family="&#39;Nanum Pen Script&#39;, cursive" font-size="44" fill="#C23B32">첫째</text>')
o.append(R(56,404,208,10,'#3E4A5E',3)); o.append(R(90,398,30,8,'#C23B32',2)); o.append(R(130,398,30,8,'#2D5BA8',2))
# poster + clock
o.append(R(60,470,150,190,'#2A3446',6)); o.append(R(72,482,126,104,'#56657D',4)); o.append(E(135,534,40,30,'#8796AD'))
o.append(R(72,600,90,8,'#8796AD',3)); o.append(R(72,618,110,8,'#8796AD',3))
o.append(P('M 196 470 L 210 470 L 210 500 Z','#11161F'))
o.append(C(620,440,42,'#2A3446')); o.append(C(620,440,34,PAPER)); o.append(L(620,440,620,416,'#2A3446',4)); o.append(L(620,440,638,450,'#2A3446',4))
# shelves
for yy in (200,310):
    o.append(R(470,yy,300,12,'#56657D')); o.append(R(470,yy+12,300,10,'#000',0,'opacity="0.35" filter="url(#b3)"'))
rnd=random.Random(91)
for x in range(484,760,40):
    h=rnd.randint(30,58); c=rnd.choice(['#6E8FB0','#8796AD','#9A7FB0','#B08F6E','#5E8F7A'])
    o.append(R(x,200-h,30,h,c,4)); o.append(R(x+4,200-h+4,6,h-10,'#fff',3,'opacity="0.25"'))
for x in range(490,760,46):
    h=rnd.randint(36,60); c=rnd.choice(['#6E8FB0','#8796AD','#B08F6E','#D9D2C0'])
    o.append(R(x,310-h,36,h,c,5)); o.append(R(x+5,310-h+5,6,h-12,'#fff',3,'opacity="0.25"'))
# monitor on left desk area
o.append(R(470,500,130,90,'#0E131B',6)); o.append(R(478,508,114,72,'#1E3A5A',3)); o.append(R(478,508,114,72,'#9CC4F0',3,'opacity="0.15"'))
o.append(R(526,590,18,30,'#2A3446'))
# bench
o.append(R(0,1056,800,144,'#0F141C'))
bt=d.lg(0,696,0,730,[(0,'#7C8BA2',1),(1,'#3E4A5E',1)])
o.append(R(70,696,660,34,bt,4))
bb=d.lg(0,730,0,980,[(0,'#2E394B',1),(1,'#161C27',1)])
o.append(R(90,730,620,250,bb))
for x in (110,316,522):
    o.append(R(x,756,170,86,'#1E2633',4)); o.append(R(x+75,792,22,8,'#8796AD',3))
o.append(R(110,858,580,96,'#1E2633',4))
o.append(R(70,730,660,16,'#000',0,'opacity="0.4" filter="url(#b3)"'))
# glassware w/ volume
def beaker(x,y,w,h,liq,lh):
    g=[]
    gl=d.lg(x,0,x+w,0,[(0,'#C8D6E6',0.55),(0.3,'#ffffff',0.15),(0.7,'#C8D6E6',0.15),(1,'#8EA0B6',0.6)])
    g.append(P(f'M{x} {y+h} L{x} {y+10} L{x-8} {y} L{x+w+8} {y} L{x+w} {y+10} L{x+w} {y+h} Z',gl))
    g.append(R(x+2,y+h-lh,w-4,lh-2,liq,2,'opacity="0.75"'))
    g.append(R(x+6,y+14,5,h-24,'#fff',2,'opacity="0.6"'))
    return ''.join(g)
o.append(beaker(176,616,44,84,'#6FB3C9',40))
o.append(beaker(600,636,36,64,'#C98A6F',26))
o.append(beaker(250,650,26,50,'#B3C96F',20))
# main beaker B with label (440,660)
o.append(beaker(372,512,136,188,'#7CC4A8',96))
o.append(R(380,600,120,96,PAPER,6)); o.append(R(380,600,120,96,'#000',6,'opacity="0.05"'))
o.append(hand_sketch(418,652,5,62,'#26324A',5))
o.append('<text x="452" y="672" font-family="&#39;Nanum Pen Script&#39;, cursive" font-size="34" fill="#C23B32">둘째</text>')
# microscope
o.append(R(660,670,56,30,'#56657D',4)); o.append(R(678,580,16,92,'#56657D',4)); o.append(R(664,598,46,18,'#8796AD',4,'transform="rotate(-25 687 607)"'))
# papers on bench
o.append(G(R(-40,-6,80,12,'#D9DCD2',1),'translate(300 700) rotate(-4)'))
# cabinet + calendar C (640,960)
o.append(R(556,850,232,206,'#262F3E')); o.append(R(556,850,232,206,'#000',0,'opacity="0.2"'))
o.append(R(546,866,200,190,PAPER,6))
o.append(R(546,866,200,36,'#B23A32',6)); o.append(R(546,886,200,16,'#B23A32'))
o.append(C(580,868,6,'#1E2633')); o.append(C(712,868,6,'#1E2633'))
for r_ in range(4):
    for c_ in range(6):
        o.append(R(556+c_*31,910+r_*30,24,22,'#D6DACF',2))
o.append(R(560,912,180,140,PAPER,4,'opacity="0.88"'))
o.append(f'<rect x="546" y="866" width="200" height="190" filter="url(#mottle2)" opacity="0.3"></rect>')
o.append(hand_sketch(612,978,2,70,'#26324A',5))
o.append('<text x="660" y="1000" font-family="&#39;Nanum Pen Script&#39;, cursive" font-size="38" fill="#C23B32">셋째</text>')
# rolling chair
o.append(G([R(-40,-90,80,70,'#1A202B',14),R(-6,-20,12,50,'#11161F'),R(-44,30,88,8,'#11161F',4),C(-40,42,7,'#11161F'),C(40,42,7,'#11161F')],'translate(250 1060)'))
o.append(vignette(d,0.6))
o.append(grain(0.06))
cuts.append(('09-lab-lit.dc.html','09-lab-lit','불 꺼진 실험실. 화이트보드, 실험대 위 비커, 벽의 달력에 손가락 그림 단서가 숨어 있다.',o,d,'#2A3446',True))

# ================= 10 notebook =================
d=Defs(); o=[]
o.append(R(0,0,800,1200,'#07090D'))
o.append(f'<rect x="0" y="0" width="800" height="1200" fill="#141820"></rect>')
o.append(mottle(0,0,800,1200,0.9))
o.append(glow(d,400,700,520,'#F5C84C',0.32))
o.append(cone(d,120,-40,-80,820,1200,'#FFE3A0',0.16,60))
o.append(dust(120,-40,0,800,1100,'#FFF0C8',70,101))
nb=[]
nb.append(R(-310,-262,620,544,'#000',10,'opacity="0.55" filter="url(#b18)" transform="translate(16 24)"'))
nb.append(R(-300,-250,300,520,'#EFE5CC',8)); nb.append(R(0,-250,300,520,'#F5ECD6',8))
nb.append(R(-300,-250,300,520,d.lg(-300,0,0,0,[(0,'#000',0),(0.85,'#000',0),(1,'#000',0.25)]),8))
nb.append(R(0,-250,300,520,d.lg(0,0,300,0,[(0,'#000',0.2),(0.12,'#000',0),(1,'#000',0.06)]),8))
nb+= [L(-280,-200+i*34,-20,-200+i*34,'#D3C6A6',2) for i in range(14)]
nb+= [L(20,-200+i*34,280,-200+i*34,'#D3C6A6',2) for i in range(14)]
nb.append(f'<rect x="-300" y="-250" width="600" height="520" filter="url(#mottle2)" opacity="0.25"></rect>')
for k in range(10): nb.append(C(0,-230+k*52,5,'#3A3530'))
PEN='#2F2A26'
nb.append(hand_sketch(-190,-60,3,90,PEN,4)); nb.append(hand_sketch(-110,140,5,90,PEN,4)); nb.append(hand_sketch(140,10,2,90,PEN,4))
nb.append('<text x="-246" y="56" font-family="&#39;Nanum Pen Script&#39;, cursive" font-size="44" fill="#8A3A2E">①</text>')
nb.append('<text x="-60" y="250" font-family="&#39;Nanum Pen Script&#39;, cursive" font-size="44" fill="#8A3A2E">②</text>')
nb.append('<text x="196" y="122" font-family="&#39;Nanum Pen Script&#39;, cursive" font-size="44" fill="#8A3A2E">③</text>')
nb.append(PL([(-140,30),(-120,50),(-100,60)],PEN,2)); nb.append(PL([(40,100),(80,60),(100,50)],PEN,2))
o.append(G(nb,'translate(400 720) rotate(-5)'))
# Harin's hand with pen (lower right)
sk='#C9A48A'; sk2='#8C6A56'; sk3='#4A3428'
o.append(E(600,1060,180,60,'#000','opacity="0.5" filter="url(#b18)"'))
o.append(P('M 820 1010 C 740 990, 690 1000, 650 1030 L 610 1080 C 640 1140, 720 1210, 820 1210 Z','#1A1D24'))
o.append(P('M 820 1010 C 760 996, 700 1004, 656 1030',None,'stroke="#4A5260" stroke-width="3" fill="none"'))
hg=d.lg(560,960,700,1110,[(0,sk,1),(0.55,sk2,1),(1,sk3,1)])
o.append(P('M 660 1032 C 620 1010, 590 990, 566 1000 C 548 1010, 552 1030, 570 1044 C 590 1060, 600 1090, 630 1110 C 660 1120, 690 1090, 690 1060 Z',hg))
o.append(P('M 566 1000 C 546 984, 534 968, 528 950 C 524 938, 536 932, 546 940 C 560 952, 574 972, 590 990 Z',sk))
o.append(P('M 570 1044 C 552 1046, 540 1056, 546 1068 C 552 1078, 572 1074, 590 1066 Z',sk2))
o.append(P('M 594 1072 C 580 1080, 578 1094, 588 1100 C 600 1104, 614 1096, 620 1088 Z',sk2))
o.append(P('M 546 940 C 556 950, 566 966, 578 980',None,f'stroke="{sk3}" stroke-width="2" fill="none" opacity="0.6"'))
o.append(P('M 600 996 C 620 1010, 640 1020, 660 1032',None,'stroke="#FFE3A0" stroke-width="3" fill="none" opacity="0.6"'))
o.append(G([R(-6,-110,12,200,'#1F2733',6),R(-6,-110,4,200,'#5A6880',2),P('M -6 90 L 0 114 L 6 90 Z','#C8B8A0'),C(0,114,1.5,'#000')],'translate(536 930) rotate(-38)'))
o.append(vignette(d,0.92,400,720,720))
o.append(grain(0.07))
cuts.append(('10-lab-clues.dc.html','10-lab-clues','하린의 수첩. 손가락 세 개, 다섯 개, 두 개를 편 손 그림이 순서대로 그려져 있다.',o,d,'#07090D',True))

# ================= 11-12 safe =================
OR='#F28C38'; OR2='#FFC27A'; GRN='#38D97A'
def safe(opened):
    d=Defs(); o=[]
    wg=d.lg(0,0,0,1200,[(0,'#15171B',1),(0.4,'#2A2D33',1),(1,'#0C0D10',1)])
    o.append(R(0,0,800,1200,wg))
    for r in range(10):
        y=r*120
        o.append(L(0,y,800,y,'#08090B',3,'opacity="0.8"'))
        for x in range(0 if r%2 else 100,800,200): o.append(L(x,y,x,y+120,'#08090B',3,'opacity="0.8"'))
    o.append(mottle(0,0,800,1200,0.85)); o.append(mottle(0,0,800,1200,0.6,'mottle2'))
    o.append(f'<rect x="0" y="0" width="800" height="1200" filter="url(#rust)" opacity="0.35"></rect>')
    o.append(drips(110,0,800,0,16,500,'#000',0.55))
    o.append(cracks(111,90,240,4,180,'#000')); o.append(cracks(112,720,1000,4,180,'#000'))
    # overhead cold light
    o.append(glow(d,400,0,420,'#C8D2E0',0.25))
    o.append(cone(d,400,-20,120,680,1100,'#C8D2E0',0.12,80))
    # recess
    o.append(R(130,290,540,680,'#050607',12))
    o.append(R(130,290,540,680,None,12,'stroke="#4A4F57" stroke-width="2" fill="none" opacity="0.6"'))
    lc=GRN if opened else RED
    o.append(R(598,248,44,28,'#3D4148',4)); o.append(C(620,262,10,lc)); o.append(glow(d,620,262,140,lc,0.55))
    if not opened:
        o.append(glow(d,520,480,480,RED,0.2))
        mg=d.lg(170,0,630,0,[(0,'#4A4F57',1),(0.25,'#7A818B',1),(0.5,'#5A6069',1),(0.8,'#6E747E',1),(1,'#3A3E45',1)])
        o.append(R(166,326,468,608,mg,8))
        o.append(f'<rect x="166" y="326" width="468" height="608" rx="8" filter="url(#mottle2)" opacity="0.8"></rect>')
        o.append(f'<rect x="166" y="326" width="468" height="608" rx="8" filter="url(#rust)" opacity="0.7"></rect>')
        rnd=random.Random(120)
        for _ in range(40):
            x=rnd.uniform(180,620); y=rnd.uniform(340,920); l=rnd.uniform(8,40); a=rnd.uniform(-0.3,0.3)
            o.append(L(x,y,x+math.cos(a)*l,y+math.sin(a)*l,'#D6DCE4',1,'opacity="0.3"'))
        o.append(R(166,326,468,8,'#C0C7D0',4,'opacity="0.6"')); o.append(R(626,326,8,608,'#000',4,'opacity="0.4"'))
        # display
        o.append(R(244,394,312,122,'#2A2D33',10)); o.append(R(252,402,296,106,'#06070A',8))
        for i in range(3):
            o.append(R(276+i*88,420,72,70,'#0E1014',6)); o.append(R(286+i*88,478,52,5,RED,2,'opacity="0.7"'))
        o.append(R(252,402,296,106,RED,8,'opacity="0.08"'))
        # palm pad
        o.append(R(282,552,236,264,'#2A2D33',20)); o.append(R(292,562,216,244,'#0B0D10',16))
        o.append(R(292,562,216,244,RED,16,'opacity="0.05"'))
        o.append(G(hand_sketch(400,712,5,132,'#FF6B6B',3),'','filter="url(#b3)" opacity="0.6"'))
        o.append(hand_sketch(400,712,5,132,'#FF9A9A',2.5,'none','opacity="0.75"'))
        for yy in (392,800):
            o.append(R(152,yy,26,96,'#80878F',4)); o.append(R(152,yy,8,96,'#D0D6DE',3,'opacity="0.5"'))
        o.append(R(556,600,30,120,'#80878F',8)); o.append(R(556,600,30,10,'#D0D6DE',4,'opacity="0.6"'))
        for (x,y) in ((190,350),(610,350),(190,910),(610,910)): o.append(C(x,y,7,'#B9C0C9')); o.append(C(x+1,y+1,7,'#000','opacity="0.35"'))
    else:
        ig=d.lg(0,330,0,930,[(0,'#5A3418',1),(0.6,'#9A5420',1),(1,'#4A2A14',1)])
        o.append(R(166,326,468,608,ig))
        o.append(glow(d,420,640,360,OR2,0.55))
        o.append(R(186,600,428,12,'#2E1A0C')); o.append(R(186,612,428,8,'#000',0,'opacity="0.4" filter="url(#b3)"'))
        o.append(P('M330 600 L476 600 L492 556 L346 556 Z','#FFF4E0'))
        o.append(P('M346 556 L492 556 L476 542 L336 542 Z','#E8D2B0'))
        o.append(E(410,604,90,8,'#000','opacity="0.3" filter="url(#b3)"'))
        # light rays out of safe
        for (a,b) in ((140,420),(300,660),(500,800)):
            o.append(PG([(300,600),(520,600),(b+200,1200),(a-60,1200)],OR2,'opacity="0.05" filter="url(#b18)"'))
        o.append(dust(410,600,140,780,1180,'#FFE2B0',90,121,2.6))
        # door swung open toward viewer-left
        dg=d.lg(20,0,170,0,[(0,'#2A2D33',1),(0.6,'#5A6069',1),(1,'#80878F',1)])
        o.append(P('M166 326 L20 280 L20 990 L166 934 Z',dg))
        o.append(f'<path d="M166 326 L20 280 L20 990 L166 934 Z" filter="url(#rust)" opacity="0.7"></path>')
        o.append(P('M166 326 L180 326 L180 934 L166 934 Z','#2A2D33'))
        o.append(P('M60 410 L146 428 L146 520 L60 508 Z','#06070A'))
        o.append(P('M64 600 L144 612 L144 810 L64 822 Z','#0B0D10'))
        o.append(P('M166 326 L20 280',None,f'stroke="{OR2}" stroke-width="3" fill="none" opacity="0.6"'))
        o.append(P('M166 326 L166 934',None,f'stroke="{OR2}" stroke-width="3" fill="none" opacity="0.7"'))
        o.append(P('M166 934 L634 934 L780 1200 L40 1200 Z',OR,'opacity="0.16" filter="url(#b8)"'))
    o.append(R(0,1040,800,160,'#070809')); o.append(L(0,1040,800,1040,'#4A4F57',2,'opacity="0.6"'))
    o.append(rubble(130,0,800,1046,1196,16,['#14161A','#1E2126','#0A0B0D']))
    o.append(vignette(d,0.9))
    o.append(grain(0.07))
    return d,o
d,o=safe(False); cuts.append(('11-safe-locked.dc.html','11-safe-locked','손바닥 모양 입력 패드와 빈칸 세 개가 있는 금고. 붉은 잠금등이 켜져 있다.',o,d,'#15171B',False))
d,o=safe(True); cuts.append(('12-safe-open.dc.html','12-safe-open','금고가 열리고 안에 접힌 메모 한 장이 놓여 있다.',o,d,'#15171B',False))

# ================= 13 memo =================
d=Defs(); o=[]
o.append(R(0,0,800,1200,'#1A0F0A'))
# blurred lab bokeh background
rnd=random.Random(130)
for _ in range(14):
    o.append(C(rnd.uniform(0,800),rnd.uniform(0,1200),rnd.uniform(20,60),rnd.choice([OR,OR2,'#8A4E26']),f'opacity="{rnd.uniform(0.08,0.25):.2f}" filter="url(#b18)"'))
o.append(glow(d,420,560,560,OR,0.4))
o.append(cone(d,560,-40,100,900,1200,OR2,0.18,80))
# memo paper with fold creases, light through
pp=[]
pp.append(R(-270,-350,540,700,'#000',6,'opacity="0.6" filter="url(#b18)" transform="translate(14 22)"'))
pg=d.lg(-270,-350,270,350,[(0,'#FFF8EA',1),(0.6,'#F6E6C8',1),(1,'#E2C9A0',1)])
pp.append(R(-270,-350,540,700,pg,6))
pp.append(PG([(-270,-118),(270,-108),(270,-96),(-270,-104)],'#000','opacity="0.08"'))
pp.append(PG([(-270,118),(270,126),(270,140),(-270,132)],'#000','opacity="0.10"'))
pp.append(L(-270,-104,270,-96,'#fff',2,'opacity="0.6"'))
pp+= [L(-224,-290+i*44,224,-290+i*44,'#E8D2AE',2) for i in range(14)]
pp.append(f'<rect x="-270" y="-350" width="540" height="700" filter="url(#mottle2)" opacity="0.18"></rect>')
o.append(G(pp,'translate(400 600) rotate(-3)'))
# hands: thumbs on front, fingers behind
SK='#C88E62'; SK2='#8A5534'; SK3='#40220F'
def holding_hand(mirror):
    g=[]
    hg=d.lg(-60,-80,60,120,[(0,SK,1),(0.5,SK2,1),(1,SK3,1)])
    # palm/back behind paper edge
    g.append(P('M -20 -60 C -60 -50, -90 -10, -96 50 C -100 120, -80 200, -60 300 L 60 300 C 50 220, 40 140, 30 80 Z',hg))
    # fingers peeking behind (on paper side) - visible tips beyond edge
    for k,y in enumerate((-80,-46,-12)):
        g.append(R(-8,y,40,28,SK2,14))
    # thumb on front of paper
    g.append(P('M -20 -40 C 0 -70, 40 -86, 66 -78 C 84 -72, 84 -52, 66 -44 C 40 -36, 16 -20, -6 -6 Z',hg))
    g.append(P('M 50 -80 C 66 -82, 80 -74, 80 -62 C 70 -70, 60 -72, 46 -72 Z','#E9B48A','opacity="0.9"'))
    g.append(E(68,-66,10,7,'#F2D2B8','opacity="0.7"'))
    # sleeve
    g.append(P('M -110 110 C -90 100, 40 100, 70 120 L 90 320 L -120 320 Z','#24150D'))
    g.append(P('M -110 110 C -90 100, 40 100, 70 120',None,f'stroke="{OR2}" stroke-width="3" fill="none" opacity="0.5"'))
    g.append(P('M -96 50 C -100 0, -70 -40, -30 -56',None,f'stroke="{OR2}" stroke-width="3" fill="none" opacity="0.6"'))
    return ''.join(g)
o.append(G(holding_hand(False),'translate(150 760) scale(1.05)'))
o.append(G(holding_hand(True),'translate(650 700) scale(-1.05 1.05)'))
o.append(vignette(d,0.85,400,600,760))
o.append(grain(0.07))
cuts.append(('13-memo.dc.html','13-memo','도윤의 손글씨 메모. 손짓만으로 여기까지 왔다면 실험은 성공이라고 적혀 있다.',o,d,'#1A0F0A',False))

# ================= 14 face looking up =================
d=Defs(); o=[]
bg=d.lg(0,0,0,1200,[(0,'#120A06',1),(0.5,'#3A2014',1),(1,'#140A06',1)])
o.append(R(0,0,800,1200,bg))
o.append(mottle(0,0,800,1200,0.8)); o.append(mottle(0,0,800,1200,0.6,'mottle2'))
# ceiling corner with pipes
o.append(P('M0 0 L800 0 L800 210 L520 330 L0 290 Z','#0B0604'))
o.append(f'<path d="M0 0 L800 0 L800 210 L520 330 L0 290 Z" filter="url(#mottle2)" opacity="0.7"></path>')
o.append(L(520,330,520,1200,'#000',3,'opacity="0.6"'))
o.append(PL([(0,200),(520,250),(800,130)],'#2A160C',16)); o.append(PL([(0,194),(520,244),(800,124)],'#7A4422',3,'opacity="0.6"'))
o.append(drips(140,0,800,280,18,300,'#000',0.5))
o.append(cracks(141,300,320,4,160,'#000'))
# camera
o.append(R(600,236,26,70,'#2A160C',4))
o.append(G([R(-70,-34,140,68,'#1C100A',14),R(-70,-34,140,10,'#4A2A16',8,'opacity="0.8"'),C(-44,0,30,'#050302'),C(-44,0,22,'#0B1A10'),C(-44,0,13,'#4BFF95'),C(-50,-6,4,'#EFFFF5')],'translate(624 334) rotate(-10)'))
o.append(glow(d,580,340,200,GRN,0.55))
o.append(PG([(560,350),(600,350),(470,720),(380,700)],GRN,'opacity="0.10" filter="url(#b18)"'))
o.append(dust(590,350,360,520,760,'#C8FFD8',40,142))
# warm key light from left
o.append(glow(d,120,700,520,OR,0.35))
# --- Harin body (shoulders) ---
SK='#E2A47A'; SKM='#B97650'; SKS='#6E3A22'; HAIR='#1A0E09'; HAIRH='#5A3220'; COAT='#E9DFD2'; COATS='#8C7A6A'
body=[]
cg=d.lg(100,900,600,1200,[(0,'#F5EDE2',1),(0.5,'#C9B9A6',1),(1,'#6E5E50',1)])
body.append(P('M 60 1210 C 70 1060, 130 960, 230 920 L 300 900 L 430 900 C 520 930, 590 1020, 620 1210 Z',cg))
body.append(P('M 300 900 L 350 1060 L 380 900 Z','#2A1A10'))
body.append(P('M 270 905 L 330 1090 L 350 1060 L 300 900 Z','#D8CCBE'))
body.append(P('M 430 900 L 380 1080 L 362 1050 L 400 900 Z','#B8A898'))
body.append(P('M 120 1080 C 160 1000, 220 950, 280 930',None,'stroke="#FFF6EA" stroke-width="3" fill="none" opacity="0.7"'))
body.append(P('M 480 980 C 520 1040, 540 1100, 550 1200',None,'stroke="#5A4A3E" stroke-width="3" fill="none" opacity="0.6"'))
o+=body
# neck
ng=d.lg(280,0,420,0,[(0,SK,1),(0.6,SKM,1),(1,SKS,1)])
o.append(P('M 296 760 C 300 820, 296 870, 290 912 L 420 912 C 410 860, 404 810, 400 760 Z',ng))
o.append(P('M 330 790 C 350 840, 380 880, 410 905',None,f'stroke="{SKS}" stroke-width="4" fill="none" opacity="0.5"'))
# head (local, rotated back)
face='M -40 -95 C 10 -110, 50 -90, 62 -55 C 68 -40, 70 -30, 70 -24 C 68 -16, 70 -10, 78 0 L 92 14 C 90 20, 82 22, 74 22 C 78 26, 80 30, 79 33 C 76 36, 72 38, 72 40 C 77 42, 79 46, 76 50 C 72 54, 68 56, 70 60 C 74 66, 74 72, 68 78 C 56 88, 40 94, 20 92 C 0 90, -10 80, -14 70 L -60 40 C -80 0, -80 -70, -40 -95 Z'
cp=d.clip(f'<path d="{face}"></path>')
fg=d.lg(90,-40,-60,40,[(0,'#FFD2AE',1),(0.35,SK,1),(0.75,SKM,1),(1,SKS,1)])
hd=[]
hd.append(P(face,fg))
hd.append(G([P('M 0 -110 C -6 -40, 0 20, 24 96 L -90 96 L -90 -110 Z',SKS,'opacity="0.55"'),
             P('M -14 70 C 20 90, 50 92, 70 76 L 70 110 L -20 110 Z',SKS,'opacity="0.6"'),
             E(54,24,22,14,'#FF8A7A','opacity="0.35" filter="url(#b8)"'),
             P('M 70 -24 C 72 -12, 82 2, 92 14',None,'stroke="#FFF1E0" stroke-width="3" fill="none" opacity="0.8"')],'',f'clip-path="{cp}"'))
# features
hd.append(P('M 22 -16 C 30 -26, 44 -26, 54 -14',None,'stroke="#2A140A" stroke-width="4" fill="none" stroke-linecap="round"'))
hd.append(P('M 26 -14 C 24 -10, 22 -8, 18 -8',None,'stroke="#2A140A" stroke-width="2.5" fill="none"'))
hd.append(P('M 20 -40 C 34 -48, 52 -46, 64 -38',None,'stroke="#2A140A" stroke-width="5" fill="none" stroke-linecap="round"'))
hd.append(P('M 62 40 C 68 42, 72 40, 76 36',None,'stroke="#7A2E1E" stroke-width="3.5" fill="none" stroke-linecap="round"'))
hd.append(P('M 56 34 C 60 40, 62 42, 64 41',None,'stroke="#7A2E1E" stroke-width="2.5" fill="none"'))
hd.append(P('M 74 10 C 76 16, 80 18, 84 16',None,f'stroke="{SKS}" stroke-width="2" fill="none" opacity="0.8"'))
# ear
hd.append(E(-14,10,12,20,SKM)); hd.append(P('M -18 0 C -8 4, -8 18, -16 24',None,f'stroke="{SKS}" stroke-width="3" fill="none"'))
# hair
hg=d.lg(-80,-110,60,60,[(0,HAIRH,1),(0.4,HAIR,1),(1,'#080403',1)])
hd.append(P('M -60 -60 C -120 -40, -130 50, -110 140 C -96 90, -86 40, -60 0 Z',hg))
hd.append(P('M 64 -56 C 52 -100, -6 -122, -58 -86 C -92 -56, -90 6, -62 44 C -52 22, -42 4, -26 -6 C -8 -26, 18 -40, 40 -46 C 52 -48, 60 -52, 64 -56 Z',hg))
hd.append(P('M 12 -44 C 0 -12, -4 24, 4 56 C -10 34, -16 0, -8 -40 Z',HAIR))
hd.append(P('M 40 -46 C 52 -40, 60 -30, 62 -20 C 52 -30, 42 -36, 30 -40 Z',HAIR))
for k in range(6):
    a=-40+k*14
    hd.append(P(f'M {a+60} -70 C {a+20} -96, {a-30} -90, {a-56} -50',None,f'stroke="{OR2}" stroke-width="2" fill="none" opacity="{0.25+0.08*k:.2f}"'))
hd.append(P('M 60 -60 C 40 -100, -10 -116, -52 -90',None,f'stroke="{OR2}" stroke-width="4" fill="none" opacity="0.7"'))
hd.append(P('M -100 100 C -110 60, -104 10, -76 -20',None,f'stroke="{GRN}" stroke-width="2.5" fill="none" opacity="0.4"'))
hd.append(E(-58,-30,10,6,'#2A1610'))
o.append(G(hd,'translate(330 700) scale(1.75) rotate(-26)'))
# green rim on face from camera (top-right)
o.append(P('M 400 520 C 440 540, 470 570, 480 600',None,f'stroke="{GRN}" stroke-width="3" fill="none" opacity="0.35"'))
# bottom space for 👍 guide: darken
o.append(R(0,1000,800,200,d.lg(0,1000,0,1200,[(0,'#000',0),(1,'#000',0.55)])))
o.append(vignette(d,0.8))
o.append(grain(0.07))
cuts.append(('14-thumbs-up.dc.html','14-thumbs-up','천장의 카메라 렌즈에 초록불이 켜지고, 하린이 웃으며 올려다본다.',o,d,'#120A06',False))

# ================= 15 result =================
d=Defs(); o=[]
sky=d.lg(0,0,0,760,[(0,'#2A2A44',1),(0.35,'#8A5A6A',1),(0.7,'#F29A5A',1),(1,'#FFD39A',1)])
o.append(R(0,0,800,760,sky))
o.append(glow(d,420,720,420,'#FFE6B0',0.8))
o.append(C(420,720,70,'#FFF3D6'))
# rays
for k in range(9):
    a=math.pi+0.18+k*0.33
    o.append(PG([(420,720),(420+math.cos(a-0.05)*900,720+math.sin(a-0.05)*900),(420+math.cos(a+0.05)*900,720+math.sin(a+0.05)*900)],'#FFE6B0','opacity="0.08" filter="url(#b18)"'))
# distant worn buildings
rnd=random.Random(150); x=0
while x<800:
    w=rnd.randint(50,110); h=rnd.randint(80,240)
    o.append(R(x,720-h,w,h,'#5A3A3A','opacity="0.55"'))
    for _ in range(rnd.randint(0,3)):
        o.append(R(x+rnd.randint(6,w-14),720-h+rnd.randint(10,h-20),6,8,'#FFD39A','opacity="0.5"'))
    x+=w+rnd.randint(0,8)
x=0; rnd=random.Random(151)
while x<800:
    w=rnd.randint(70,150); h=rnd.randint(40,150)
    o.append(R(x,740-h,w,h+20,'#2E1C1C'))
    o.append(R(x,740-h,w,3,'#FFB070','opacity="0.6"'))
    x+=w
# poles & wires
o.append(L(120,380,120,760,'#1A0E0C',6)); o.append(L(96,400,144,400,'#1A0E0C',4))
o.append(P('M 0 420 C 60 440, 100 410, 120 402 C 300 450, 600 440, 800 410',None,'stroke="#1A0E0C" stroke-width="2" fill="none"'))
o.append(P('M 0 440 C 80 460, 110 420, 120 412 C 330 470, 620 460, 800 430',None,'stroke="#1A0E0C" stroke-width="1.5" fill="none"'))
# lab exit structure + broken fence
o.append(R(600,600,200,180,'#1C100C')); o.append(R(600,600,200,6,'#FF9A50','opacity="0.6"'))
for xx in range(0,260,26): o.append(L(xx,640,xx+6,760,'#1A0E0C',3))
o.append(L(0,650,260,640,'#1A0E0C',3)); o.append(L(0,700,240,690,'#1A0E0C',2))
# stairs foreground
for i in range(6):
    y=760+i*76
    sg=d.lg(0,y,0,y+76,[(0,'#7A4A30',1),(0.12,'#3A2218',1),(1,'#1E110C',1)])
    o.append(R(0,y,800,76,sg)); o.append(L(0,y,800,y,'#FFB070',2,'opacity="0.55"'))
o.append(f'<rect x="0" y="760" width="800" height="440" filter="url(#mottle)" opacity="0.8"></rect>')
o.append(cracks(152,200,900,4,200,'#000')); o.append(rubble(153,0,800,770,1190,20,['#2A1810','#3B2216','#140A06']))
# rails
o.append(L(40,600,40,1200,'#140A06',8)); o.append(L(40,620,760,620,'#140A06',6)); o.append(L(760,600,760,1200,'#140A06',8))
o.append(L(40,616,760,616,'#FFB070',1.5,'opacity="0.5"'))
# figures (front-facing silhouettes, back-lit)
S='#120806'; RIM='#FFC27A'
def figure(ponytail, tall):
    g=[]
    hair = ('M -36 -548 C -40 -600, 40 -604, 38 -548 C 44 -560, 30 -590, 0 -594 C -30 -592, -44 -566, -36 -548 Z' if ponytail else
            'M -38 -548 L -46 -578 L -30 -572 L -34 -600 L -14 -586 L -6 -614 L 8 -590 L 26 -610 L 26 -584 L 46 -594 L 38 -562 L 44 -548 Z')
    parts=[E(0,-548,34,42,S),P(hair,S),R(-13,-512,26,30,S),
           P('M -14 -486 C -54 -484, -92 -472, -102 -444 C -112 -404, -114 -330, -110 -260 L -116 -150 L 116 -150 L 110 -260 C 114 -330, 112 -404, 102 -444 C 92 -472, 54 -484, 14 -486 Z',S),
           P('M -70 -160 L -60 0 L -16 0 L -8 -160 Z',S), P('M 8 -160 L 16 0 L 60 0 L 70 -160 Z',S),
           P('M 102 -444 C 120 -400, 126 -340, 122 -270 L 100 -268 C 102 -330, 98 -390, 90 -430 Z',S),
           P('M -96 -446 C -136 -430, -156 -400, -156 -360 L -132 -356 C -130 -390, -116 -414, -88 -420 Z',S),
           P('M -156 -360 C -162 -400, -166 -440, -160 -470 L -136 -468 C -140 -440, -136 -400, -132 -356 Z',S),
           R(-170,-496,40,34,S,10), R(-162,-532,16,42,S,8)]
    if ponytail: parts.append(P('M 30 -566 C 64 -550, 70 -500, 54 -470 C 50 -500, 44 -530, 26 -546 Z',S))
    g.append(G(parts,'',f'stroke="{RIM}" stroke-width="5" stroke-linejoin="round"'))
    g.append(G(parts,'translate(0 3)'))
    # coat opening / volume
    g.append(P('M -10 -480 L -20 -160',None,f'stroke="#3A2218" stroke-width="3" fill="none"'))
    g.append(P('M -102 -444 C -112 -404, -114 -330, -110 -260',None,f'stroke="{RIM}" stroke-width="2" fill="none" opacity="0.4" transform="translate(4 0)"'))
    g.append(P('M -36 -580 C -20 -598, 20 -598, 34 -580',None,f'stroke="#FFF0D6" stroke-width="3" fill="none" opacity="0.9"'))
    return ''.join(g)
o.append(E(400,1000,280,30,'#000','opacity="0.45" filter="url(#b8)"'))
o.append(G(figure(True,False),'translate(310 1000) scale(0.98)'))
o.append(G(figure(False,True),'translate(500 1000) scale(-1.08 1.08)'))
o.append(glow(d,420,720,240,'#FFE6B0',0.25))
o.append(vignette(d,0.55))
o.append(grain(0.06))
cuts.append(('15-result.dc.html','15-result','연구실 밖 계단에서 하린과 도윤이 나란히 엄지를 들고 있다.',o,d,'#2A2A44',False))

for fn,nm,alt,o,d,bg,font in cuts:
    open(os.path.join(ROOT,fn),'w').write(page(nm,alt,o,d,bg,font))
print('written',len(cuts))
