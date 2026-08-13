import pdfplumber, json, re

COLS = [
    ("dow",0,41),("gmon",41,60),("gday",60,95),("hmon",95,145),("hday",145,162),
    ("imsaak",162,196),("fajr",196,225),("srise",225,257),("zohar",257,292),
    ("sset",292,322),("maghrib",322,358),("midnight",358,392),("event",392,700),
]
def col_of(x):
    for n,lo,hi in COLS:
        if lo<=x<hi: return n
    return "event"

GMON={"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12}
DIM={1:31,2:28,3:31,4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31}
TIME_RE=re.compile(r'^\d{1,2}:\d{2}[ap]$')
GLUE=re.compile(r'^(\d{1,2}:\d{2}[ap])(.+)$')

def extract_page(p):
    raw=[w for w in p.extract_words(use_text_flow=False,keep_blank_chars=False) if 118<w['top']<660]
    # split glued "TIMEtext" tokens: time stays at its x, remainder forced into event col
    words=[]
    for w in raw:
        m=GLUE.match(w['text'])
        if m and not TIME_RE.match(w['text']):
            words.append({'text':m.group(1),'x0':w['x0'],'x1':w['x0']+20,'top':w['top']})
            words.append({'text':m.group(2),'x0':395,'x1':420,'top':w['top']})
        else:
            words.append(w)
    words.sort(key=lambda w:(w['top'],w['x0']))
    rows=[];cur=[];ct=None
    for w in words:
        if ct is None or abs(w['top']-ct)<=4:
            cur.append(w); ct=w['top'] if ct is None else ct
        else:
            rows.append(cur);cur=[w];ct=w['top']
    if cur: rows.append(cur)
    out=[]
    for ws in rows:
        d={}
        for w in ws:
            c=col_of((w['x0']+w['x1'])/2)
            d[c]=(d.get(c,"")+" "+w['text']).strip()
        # split glued hijri "MonthNameDD" -> name + day
        if d.get('hmon') and not d.get('hday'):
            m=re.match(r'^(.+?)(\d{1,2})$', d['hmon'])
            if m:
                d['hmon']=m.group(1); d['hday']=m.group(2)
        out.append(d)
    return out

pdf=pdfplumber.open('MASOM-Calendar-2026.pdf')
days=[]; anomalies=[]
for pi in range(12):
    rows=extract_page(pdf.pages[pi])
    gmon=None; last=None
    for r in rows:
        if r.get('gmon'): gmon=GMON[r['gmon']]
        gday=r.get('gday','')
        if not gday.isdigit():
            # event-only continuation row -> attach to previous day
            if r.get('event') and last is not None:
                last['event2']=r['event']
            continue
        gd=int(gday)
        rec={'month':gmon,'day':gd,'dow':r.get('dow',''),
            'hmon':r.get('hmon',''),'hday':r.get('hday',''),
            'imsaak':r.get('imsaak',''),'fajr':r.get('fajr',''),'srise':r.get('srise',''),
            'zohar':r.get('zohar',''),'sset':r.get('sset',''),'maghrib':r.get('maghrib',''),
            'midnight':r.get('midnight',''),'event':r.get('event',''),}
        for k in ['imsaak','fajr','srise','zohar','sset','maghrib','midnight']:
            v=rec[k]
            if v=='': anomalies.append(f"{gmon:02d}-{gd:02d} MISSING {k}")
            elif not TIME_RE.match(v): anomalies.append(f"{gmon:02d}-{gd:02d} BADFMT {k}={v!r}")
        days.append(rec); last=rec

from collections import Counter
cnt=Counter(d['month'] for d in days)
for m in range(1,13):
    if cnt[m]!=DIM[m]: anomalies.append(f"MONTH {m}: got {cnt[m]}, expected {DIM[m]}")

json.dump(days,open('cal_days.json','w'),indent=0)
print("total day rows:",len(days),"(expected 365)")
print("per-month:",dict(sorted(cnt.items())))
print("\n--- ANOMALIES (%d) ---"%len(anomalies))
for a in anomalies: print(a)
