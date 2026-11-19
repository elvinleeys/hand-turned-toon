import random, math
W,H=800,1200
def R(x,y,w,h,f,rx=0,extra=''):
    fa='' if f is None else f'fill="{f}"'
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" {fa} {extra}></rect>'
def P(d,f='none',extra=''):
    fa='' if f is None else f'fill="{f}"'
    return f'<path d="{d}" {fa} {extra}></path>'
def C(cx,cy,r,f,extra=''):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{f}" {extra}></circle>'
def E(cx,cy,rx,ry,f,extra=''):
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{f}" {extra}></ellipse>'
def L(x1,y1,x2,y2,s,w=2,extra=''):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{s}" stroke-width="{w}" stroke-linecap="round" {extra}></line>'
def PL(pts,s,w=2,extra=''):
    p=' '.join(f'{a:.1f},{b:.1f}' for a,b in pts)
    return f'<polyline points="{p}" fill="none" stroke="{s}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}></polyline>'
def PG(pts,f,extra=''):
    p=' '.join(f'{a:.1f},{b:.1f}' for a,b in pts)
    return f'<polygon points="{p}" fill="{f}" {extra}></polygon>'
def G(inner,t='',extra=''):
    if isinstance(inner,list): inner=''.join(inner)
    tt=f' transform="{t}"' if t else ''
    return f'<g{tt} {extra}>{inner}</g>'

class Defs:
    def __init__(s): s.items=[]; s.n=0
    def _id(s,p): s.n+=1; return f'{p}{s.n}'
    def lg(s,x1,y1,x2,y2,stops):
        i=s._id('lg'); st=''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"></stop>' for o,c,a in stops)
        s.items.append(f'<linearGradient id="{i}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{st}</linearGradient>')
        return f'url(#{i})'
    def rg(s,cx,cy,r,stops,fx=None,fy=None):
        i=s._id('rg'); st=''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"></stop>' for o,c,a in stops)
        f=f' fx="{fx}" fy="{fy}"' if fx is not None else ''
        s.items.append(f'<radialGradient id="{i}" gradientUnits="userSpaceOnUse" cx="{cx}" cy="{cy}" r="{r}"{f}>{st}</radialGradient>')
        return f'url(#{i})'
    def clip(s,inner):
        i=s._id('cp'); s.items.append(f'<clipPath id="{i}">{inner}</clipPath>'); return f'url(#{i})'
    def render(s):
        base='''<filter id="b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"></feGaussianBlur></filter>
<filter id="b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"></feGaussianBlur></filter>
<filter id="b18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"></feGaussianBlur></filter>
<filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"></feGaussianBlur></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.75"></feColorMatrix></filter>
<filter id="grainD" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="7"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 -0.8"></feColorMatrix></filter>
<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="3"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -0.95"></feColorMatrix></filter>
<filter id="mottle2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="11"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.6 -1.2"></feColorMatrix></filter>
<filter id="rust" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="5"></feTurbulence><feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.22  0 0 0 0 0.10  0 0 0 3 -1.55"></feColorMatrix></filter>'''
        return '<defs>'+base+''.join(s.items)+'</defs>'

def mottle(x,y,w,h,op=0.6,fid='mottle',clip=None):
    c=f'clip-path="{clip}"' if clip else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" filter="url(#{fid})" opacity="{op}" {c}></rect>'
def grain(op=0.07):
    return f'<rect x="0" y="0" width="800" height="1200" filter="url(#grain)" opacity="{op}"></rect><rect x="0" y="0" width="800" height="1200" filter="url(#grainD)" opacity="{op*1.4}"></rect>'
def vignette(d,op=0.85,cx=400,cy=600,r=760,col='#000'):
    g=d.rg(cx,cy,r,[(0,col,0),(0.55,col,0),(1,col,op)])
    return R(0,0,800,1200,g)
def glow(d,cx,cy,r,col,op):
    g=d.rg(cx,cy,r,[(0,col,op),(0.35,col,op*0.45),(1,col,0)])
    return C(cx,cy,r,g)
def cone(d,sx,sy,xl,xr,yb,col,op,spread=0):
    g=d.lg(sx,sy,sx,yb,[(0,col,op),(1,col,0)])
    return PG([(sx-6-spread,sy),(sx+6+spread,sy),(xr,yb),(xl,yb)],g,'filter="url(#b18)"')
def dust(sx,sy,xl,xr,yb,col,n,seed,rmax=2.4):
    rnd=random.Random(seed); o=[]
    for _ in range(n):
        t=rnd.random()**0.8
        y=sy+(yb-sy)*t
        a=sx+(xl-sx)*t; b=sx+(xr-sx)*t
        x=a+(b-a)*rnd.random()
        o.append(C(x,y,rnd.uniform(0.6,rmax),col,f'opacity="{rnd.uniform(0.15,0.75)*(1-t*0.6):.2f}"'))
    return ''.join(o)
def cracks(seed,x,y,n,length,col,w=1.6,op=0.7):
    rnd=random.Random(seed); o=[]
    for _ in range(n):
        pts=[(x,y)]; ang=rnd.uniform(0,2*math.pi); cx,cy=x,y
        for k in range(rnd.randint(3,6)):
            ang+=rnd.uniform(-0.7,0.7); step=length*rnd.uniform(0.15,0.35)
            cx+=math.cos(ang)*step; cy+=math.sin(ang)*step; pts.append((cx,cy))
        o.append(PL(pts,col,w*rnd.uniform(0.6,1.2),f'opacity="{op}"'))
    return ''.join(o)
def drips(seed,x0,x1,y,n,len_,col,op=0.35):
    rnd=random.Random(seed); o=[]
    for _ in range(n):
        x=rnd.uniform(x0,x1); l=rnd.uniform(len_*0.3,len_); w=rnd.uniform(2,7)
        o.append(R(x,y,w,l,col,w/2,f'opacity="{rnd.uniform(op*0.4,op):.2f}" filter="url(#b3)"'))
    return ''.join(o)
def specks(seed,x0,y0,x1,y1,n,col,op=0.5,rmax=3):
    rnd=random.Random(seed)
    return ''.join(C(rnd.uniform(x0,x1),rnd.uniform(y0,y1),rnd.uniform(0.5,rmax),col,f'opacity="{rnd.uniform(0.2,op):.2f}"') for _ in range(n))
def rubble(seed,x0,x1,y0,y1,n,cols):
    rnd=random.Random(seed); o=[]
    for _ in range(n):
        x=rnd.uniform(x0,x1); y=rnd.uniform(y0,y1); s=rnd.uniform(4,16)*(0.5+(y-y0)/(y1-y0+1))
        pts=[(x+math.cos(a)*s*rnd.uniform(0.6,1.2), y+math.sin(a)*s*0.6*rnd.uniform(0.6,1.2)) for a in [k*2*math.pi/5+rnd.uniform(0,0.6) for k in range(5)]]
        o.append(PG(pts,rnd.choice(cols)))
        o.append(PL(pts[:3],'#ffffff',1,'opacity="0.12"'))
    return ''.join(o)

# ---------- characters
def harin_back(d, rim, coat, coat_hi, hair, hair_hi, skin, skin_sh, phone=True, phone_col='#CFE4F5'):
    """Over-the-shoulder back view. local origin = head centre, head ~110px tall."""
    def shapes(fh,fs,fc,fc2):
        o=[]
        # coat body
        o.append(P('M -24 86 C -72 88, -114 100, -130 128 C -142 156, -146 220, -148 300 L -154 640 L 162 640 L 156 300 C 154 220, 148 156, 136 128 C 120 100, 78 88, 30 86 Z',fc))
        o.append(P('M -130 140 C -154 220, -160 330, -152 440 L -124 444 C -128 340, -118 240, -104 170 Z',fc))
        if phone:
            o.append(P('M 130 132 C 166 168, 184 214, 190 258 L 162 270 C 152 234, 138 196, 112 168 Z',fc))
            o.append(P('M 162 270 C 176 226, 186 186, 196 152 L 220 160 C 214 196, 202 244, 188 262 Z',fc))
        o.append(P('M -18 44 L 22 44 L 28 100 L -24 100 Z',fs))
        o.append(P('M -42 72 C -54 96, -46 112, -24 118 L 38 118 C 58 112, 62 96, 50 72 C 28 90, -20 90, -42 72 Z',fc2))
        o.append(P('M -46 6 C -50 -34, -24 -60, 4 -58 C 36 -56, 54 -30, 50 8 C 48 36, 34 54, 6 56 C -22 56, -42 38, -46 6 Z',fh))
        o.append(E(51,14,7,13,fs))
        o.append(P('M -6 16 C -24 50, -30 108, -12 172 C -2 146, 10 120, 16 96 C 24 70, 22 40, 12 16 Z',fh))
        return o
    out=[]
    out.append(G(shapes(rim,rim,rim,rim),'',f'stroke="{rim}" stroke-width="5" stroke-linejoin="round"'))
    out.append(G(shapes(hair,skin_sh,coat,coat_hi),'translate(-1 4)'))
    # internal light / volume
    out.append(P('M 22 -50 C 40 -40, 50 -20, 48 6 C 40 -16, 30 -34, 10 -46 Z',hair_hi,'opacity="0.8"'))
    for k,(a,b) in enumerate([(-30,-40),(-10,-48),(10,-46),(28,-38)]):
        out.append(P(f'M {a} {b} C {a-6} {b+30}, {a-10} {b+50}, {-2} 20',None,f'stroke="{hair_hi}" stroke-width="1.6" fill="none" opacity="0.6"'))
    out.append(P('M 2 26 C -6 60, -10 110, -6 160',None,f'stroke="{hair_hi}" stroke-width="2" fill="none" opacity="0.5"'))
    out.append(E(3,19,12,6,'#05080B'))
    # coat folds & shoulder blades
    out.append(P('M -96 150 C -70 190, -60 250, -66 330',None,f'stroke="{coat_hi}" stroke-width="3" fill="none" opacity="0.55"'))
    out.append(P('M 94 150 C 72 196, 64 250, 70 330',None,f'stroke="{coat_hi}" stroke-width="3" fill="none" opacity="0.55"'))
    out.append(P('M 4 130 C 0 220, 6 320, 2 640',None,f'stroke="#000" stroke-width="3" fill="none" opacity="0.5"'))
    out.append(P('M -128 130 C -110 112, -60 98, -20 100 C -60 112, -100 124, -120 150 Z',coat_hi,'opacity="0.55"'))
    out.append(P('M 134 130 C 116 112, 70 98, 30 100 C 70 112, 108 124, 126 150 Z',coat_hi,'opacity="0.55"'))
    out.append(P('M -150 300 C -120 360, -60 380, 0 380 C 60 380, 120 360, 156 300 L 162 640 L -154 640 Z','#000','opacity="0.35"'))
    if phone:
        out.append(G([R(-36,-62,72,124,'#07090C',10), R(-30,-54,60,108,phone_col,5),
                       R(-30,-54,60,108,'#ffffff',5,'opacity="0.18"')],'translate(206 92) rotate(-8)'))
        out.append(glow(d,206,96,170,phone_col,0.22))
        # fingers wrapping phone
        for i,yy in enumerate((120,138,154)):
            out.append(E(176-i*2,yy,9,7,skin))
            out.append(E(176-i*2,yy-2,6,3,phone_col,'opacity="0.35"'))
        out.append(E(236,128,8,14,skin)); out.append(E(238,124,4,8,phone_col,'opacity="0.4"'))
        # phone light on ear / cheek edge
        out.append(P('M 48 -4 C 58 8, 58 30, 46 44',None,f'stroke="{phone_col}" stroke-width="3" fill="none" opacity="0.65"'))
        out.append(P('M 132 136 C 160 162, 178 200, 186 240',None,f'stroke="{phone_col}" stroke-width="2.5" fill="none" opacity="0.5"'))
    return ''.join(out)

def fist(d, skin_hi, skin, skin_sh, sleeve, sleeve_hi, rimc, rimop=0.7):
    o=[]
    # sleeve
    o.append(P('M -84 40 C -98 120, -110 200, -124 290 L 170 290 C 150 200, 128 120, 96 40 Z',sleeve))
    o.append(P('M -84 40 C 0 70, 60 64, 96 40 L 100 60 C 60 86, -10 92, -88 64 Z',sleeve_hi,'opacity="0.7"'))
    for x1,x2 in ((-60,-80),(10,0),(70,96)):
        o.append(P(f'M {x1} 90 C {x1-6} 160, {x2} 220, {x2-4} 290',None,f'stroke="#000" stroke-width="3" fill="none" opacity="0.45"'))
    o.append(P('M -30 100 C -20 160, -30 220, -40 290',None,f'stroke="{sleeve_hi}" stroke-width="2" fill="none" opacity="0.5"'))
    # wrist
    o.append(P('M -70 20 L 80 20 L 90 60 L -78 60 Z',skin_sh))
    # back of hand
    g=d.lg(0,-110,0,60,[(0,skin_hi,1),(0.45,skin,1),(1,skin_sh,1)])
    hand='M -98 -34 C -100 -74, -62 -100, -12 -102 C 40 -104, 92 -88, 102 -48 C 108 -12, 98 28, 72 48 L -68 48 C -94 28, -98 -4, -98 -34 Z'
    o.append(P(hand,g))
    # thumb along left side
    o.append(P('M -98 -46 C -124 -34, -130 8, -112 36 C -98 50, -80 44, -78 28 C -88 10, -90 -12, -86 -34 Z',skin))
    o.append(P('M -112 36 C -98 50, -80 44, -78 28 C -90 34, -104 34, -112 30 Z',skin_sh))
    # curled finger segments (row of knuckles)
    xs=[(-88,46,-132),(-42,46,-136),(4,44,-134),(48,40,-124)]
    for x,w,y in xs:
        fg=d.lg(0,y,0,y+56,[(0,skin_hi,1),(0.5,skin,1),(1,skin_sh,1)])
        o.append(R(x,y,w,58,fg,21))
        o.append(E(x+w*0.5,y+12,w*0.3,7,'#ffffff','opacity="0.16"'))
        o.append(L(x+w-1,y+14,x+w-1,y+50,'#000',2,'opacity="0.35"'))
    # knuckle bumps + tendons
    for x,w,y in xs:
        kx=x+w*0.5
        o.append(E(kx,-96,12,7,skin_hi,'opacity="0.8"'))
        o.append(P(f'M {kx} -88 C {kx-4} -50, {kx*0.6} -10, {kx*0.4} 30',None,f'stroke="{skin_hi}" stroke-width="3" fill="none" opacity="0.35"'))
    # shadow lower-left
    o.append(P('M -98 -34 C -98 -4, -94 28, -68 48 L 10 48 C -40 30, -80 0, -98 -34 Z',skin_sh,'opacity="0.6"'))
    # coloured rim on right
    o.append(P('M 88 -124 C 92 -100, 104 -70, 104 -40 C 106 -8, 98 26, 74 48',None,f'stroke="{rimc}" stroke-width="5" fill="none" opacity="{rimop}"'))
    o.append(P('M 50 -122 C 70 -128, 86 -126, 88 -112',None,f'stroke="{rimc}" stroke-width="4" fill="none" opacity="{rimop}"'))
    return ''.join(o)

def hand_sketch(cx,cy,n,s,stroke,w=4,fill='none',extra=''):
    sc=s/100; o=[]
    sw=f'{w/sc:.2f}'
    o.append(f'<path d="M -32 0 C -34 30, -24 50, 0 52 C 24 50, 34 30, 32 0 L 32 -10 L -32 -10 Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"></path>')
    raised={2:[0,1],3:[0,1,2],5:[0,1,2,3]}[n]
    xs=[-28,-13,2,17]; lens=[50,58,52,40]
    for i,x in enumerate(xs):
        if i in raised:
            o.append(f'<rect x="{x}" y="{-10-lens[i]}" width="12" height="{lens[i]+14}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"></rect>')
            o.append(f'<line x1="{x+2}" y1="{-10-lens[i]*0.55}" x2="{x+10}" y2="{-10-lens[i]*0.55}" stroke="{stroke}" stroke-width="{float(sw)*0.5:.2f}" opacity="0.6"></line>')
        else:
            o.append(f'<rect x="{x}" y="-18" width="12" height="20" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"></rect>')
    if n==5:
        o.append(f'<rect x="-58" y="0" width="12" height="44" rx="6" transform="rotate(-40 -40 30)" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"></rect>')
    else:
        o.append(f'<rect x="-40" y="14" width="12" height="30" rx="6" transform="rotate(-60 -30 30)" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"></rect>')
    return f'<g transform="translate({cx} {cy}) scale({sc})" {extra}>{"".join(o)}</g>'
