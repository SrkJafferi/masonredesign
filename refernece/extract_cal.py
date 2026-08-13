import pdfplumber, json, sys

# Column boundaries derived from header x-positions.
# label: (xmin, xmax)
COLS = [
    ("dow",   0,    41),
    ("gmon",  41,   60),
    ("gday",  60,   95),
    ("hmon",  95,   145),
    ("hday",  145,  162),
    ("imsaak",162,  196),
    ("fajr",  196,  225),
    ("srise", 225,  257),
    ("zohar", 257,  292),
    ("sset",  292,  322),
    ("maghrib",322, 358),
    ("midnight",358,392),
    ("event", 392,  700),
]

def col_of(x):
    for name, lo, hi in COLS:
        if lo <= x < hi:
            return name
    return "event"

def extract_page(p):
    words = p.extract_words(use_text_flow=False, keep_blank_chars=False)
    # keep only rows below header (top>118)
    words = [w for w in words if w['top'] > 118]
    # cluster into rows by top with tolerance
    words.sort(key=lambda w: (w['top'], w['x0']))
    rows = []
    cur = []
    cur_top = None
    for w in words:
        if cur_top is None or abs(w['top']-cur_top) <= 4:
            cur.append(w)
            cur_top = w['top'] if cur_top is None else cur_top
        else:
            rows.append((cur_top, cur))
            cur = [w]
            cur_top = w['top']
    if cur:
        rows.append((cur_top, cur))
    out = []
    for top, ws in rows:
        d = {}
        for w in ws:
            c = col_of((w['x0']+w['x1'])/2)
            d[c] = (d.get(c,"") + " " + w['text']).strip()
        d['_top'] = round(top,1)
        out.append(d)
    return out

pdf = pdfplumber.open('MASOM-Calendar-2026.pdf')
pi = int(sys.argv[1]) if len(sys.argv)>1 else 0
rows = extract_page(pdf.pages[pi])
order = ["_top","dow","gmon","gday","hmon","hday","imsaak","fajr","srise","zohar","sset","maghrib","midnight","event"]
for r in rows:
    print(" | ".join(f"{r.get(k,'')}" for k in order))
