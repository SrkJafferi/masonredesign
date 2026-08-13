import json, re

days = json.load(open("cal_days.json"))
def iso(m, d): return f"2026-{m:02d}-{d:02d}"

# ---- hijri_months boundaries ----
NAME2NUM = {"Muharram":1,"Safar":2,"Rabi-ul-Awwal":3,"Rabi-us-Saani":4,
    "Jamadi-ul-Awwal":5,"Jamadi-us-Saani":6,"Rajab":7,"Shaabaan":8,
    "Ramzan":9,"Shawwal":10,"Zeeqa'ad":11,"Zilhajj":12}
NUM2NAME = {v: k for k, v in NAME2NUM.items()}

# Rajab 1447 began Dec 22 2025 (Jan 1 2026 = Rajab 11), needed so early Jan resolves.
boundaries = [("2025-12-22", 1447, 7)]
year, prev_num = 1447, 7
for d in days:
    if int(d["hday"]) == 1 and d["hmon"]:
        num = NAME2NUM[d["hmon"]]
        if num < prev_num:          # month number wrapped -> new Hijri year
            year += 1
        boundaries.append((iso(d["month"], d["day"]), year, num))
        prev_num = num

hm_body = "\n".join(
    f'  {{ hijri_year: {y}, hijri_month: {m}, gregorian_start: "{start}" }},  // {NUM2NAME[m]} {y}'
    for start, y, m in boundaries
)

# ---- calendar_days ----
cd_body = "\n".join(
    f'  {{ gregorian_date: "{iso(d["month"], d["day"])}", '
    f'imsaak: "{d["imsaak"]}", fajr: "{d["fajr"]}", sunrise: "{d["srise"]}", '
    f'zohar: "{d["zohar"]}", sunset: "{d["sset"]}", maghrib: "{d["maghrib"]}", '
    f'midnight: "{d["midnight"]}" }},'
    for d in days
)

# ---- calendar_events ----
def category(t):
    tl = t.lower()
    if tl.startswith("wiladat"): return "Wiladat"
    if tl.startswith("martyrdom"): return "Martyrdom"
    if tl.startswith("wafat"): return "Wafat"
    if "eid" in tl: return "Eid"
    if tl.startswith("shab"): return "Shab"
    if "ziarat" in tl or "ziyarat" in tl: return "Ziarat"
    return "Historical"

ev_lines = []
for d in days:
    date = iso(d["month"], d["day"])
    evs = []
    if d.get("event"): evs.append(d["event"].strip())
    if d.get("event2"): evs.append(d["event2"].strip())
    for i, e in enumerate(evs):
        ev_lines.append(
            f'  {{ event_date: "{date}", title: {json.dumps(e)}, '
            f'category: "{category(e)}", sort_order: {i} }},'
        )
ev_body = "\n".join(ev_lines)

print("boundaries:", len(boundaries), "| days:", len(days), "| events:", len(ev_lines))

# ---- inject into seed file ----
path = "../scripts/seed-calendar.mjs"
src = open(path, encoding="utf-8").read()

def replace_block(src, varname, body):
    pat = re.compile(r"(const " + varname + r" = \[\n).*?(\n\];)", re.DOTALL)
    new, n = pat.subn(lambda m: m.group(1) + body + m.group(2), src)
    assert n == 1, f"{varname}: replaced {n}"
    return new

src = replace_block(src, "hijriMonths", hm_body)
src = replace_block(src, "calendarDays", cd_body)
src = replace_block(src, "calendarEvents", ev_body)
open(path, "w", encoding="utf-8", newline="\n").write(src)
print("seed-calendar.mjs written")
