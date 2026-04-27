#!/usr/bin/env python3
"""
LuraBio Brand Identity Canvas — Peptide Precision
Second pass: refined proportions, richer annotations, master-level craft.
"""

from PIL import Image, ImageDraw, ImageFont
import math

W, H = 2400, 3200

# ─── PALETTE ───────────────────────────────────────────────────────────────────
BG          = (250, 250, 249)   # Warm Alabaster
OBSIDIAN    = (28,  25,  23 )   # #1C1917
GOLD        = (184, 150, 46 )   # Precision gold
GOLD_MID    = (212, 179, 98 )   # mid-tone rules
GOLD_PALE   = (238, 225, 180)   # background grid
CREAM_ARC   = (216, 210, 198)   # inner arc (alabaster-toned)
RULE_FAINT  = (224, 218, 200)   # hairline rules

CAT = [
    ((196, 149, 106), "METABOLIC",      "C-01"),
    ((123, 143, 161), "NEUROCOGNITIVE",  "C-02"),
    ((107, 158, 142), "IMMUNOLOGICAL",   "C-03"),
    ((155, 141, 181), "HORMONAL",        "C-04"),
    ((163, 168, 154), "STRUCTURAL",      "C-05"),
    ((181, 135, 107), "ENZYMATIC",       "C-06"),
]

# ─── FONTS ─────────────────────────────────────────────────────────────────────
FD = "/Users/preye/.claude/skills/canvas-design/canvas-fonts/"
f_gloock_xl  = ImageFont.truetype(FD + "Gloock-Regular.ttf",    210)
f_work_bold  = ImageFont.truetype(FD + "WorkSans-Bold.ttf",      36)
f_work_light = ImageFont.truetype(FD + "WorkSans-Regular.ttf",   26)
f_mono_reg   = ImageFont.truetype(FD + "DMMono-Regular.ttf",     20)
f_mono_sm    = ImageFont.truetype(FD + "DMMono-Regular.ttf",     15)

M = 152  # outer margin

# ─── HELPERS ───────────────────────────────────────────────────────────────────
def hex_pts(cx, cy, r, rot=0):
    return [(cx + r * math.cos(math.radians(rot + i*60)),
             cy + r * math.sin(math.radians(rot + i*60)))
            for i in range(6)]

def hex_arc(draw, cx, cy, r, rot, v0, n, stroke, color):
    pts   = hex_pts(cx, cy, r, rot)
    chain = [pts[(v0 + i) % 6] for i in range(n + 1)]
    pairs = [(int(p[0]), int(p[1])) for p in chain]
    draw.line(pairs, fill=color, width=stroke, joint="miter")

def dot(draw, x, y, r, color):
    draw.ellipse([(int(x)-r, int(y)-r), (int(x)+r, int(y)+r)], fill=color)

def tracked(draw, text, font, color, cx, y, track=0):
    widths = [font.getbbox(c)[2] - font.getbbox(c)[0] for c in text]
    total  = sum(widths) + track * max(0, len(text) - 1)
    x = cx - total // 2
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=font, fill=color)
        x += w + track
    return total

def rule(draw, y, x0, x1, color, w=2):
    draw.line([(x0, y), (x1, y)], fill=color, width=w)

def vrule(draw, x, y0, y1, color, w=1):
    draw.line([(x, y0), (x, y1)], fill=color, width=w)

# ═══════════════════════════════════════════════════════════════════════════════
# BUILD CANVAS
# ═══════════════════════════════════════════════════════════════════════════════
img = Image.new("RGB", (W, H), BG)
d   = ImageDraw.Draw(img)

# ─── 1. HEX BACKGROUND GRID ────────────────────────────────────────────────────
# Flat-top hexagons. For flat-top (rot=30): horizontal step = r*1.5, vertical step = r*sqrt(3)
GR     = 32
H_STEP = GR * 1.5
V_STEP = GR * 1.7321

GRID_TOP    = 0
GRID_BOTTOM = 1560   # grid fades out here
FADE_START  = 1100   # gradient fade begins here

for col in range(-1, int(W / H_STEP) + 4):
    for row in range(-1, int(GRID_BOTTOM / V_STEP) + 4):
        gx = col * H_STEP
        gy = row * V_STEP + (V_STEP * 0.5 if col % 2 else 0)
        if gy > GRID_BOTTOM:
            continue
        # Fade out toward GRID_BOTTOM
        if gy >= FADE_START:
            t = (gy - FADE_START) / (GRID_BOTTOM - FADE_START)   # 0→1
            t = min(1.0, max(0.0, t))
            # interpolate GOLD_PALE → BG
            gc = tuple(int(GOLD_PALE[j] + t * (BG[j] - GOLD_PALE[j])) for j in range(3))
        else:
            gc = GOLD_PALE
        pts  = hex_pts(gx, gy, GR - 2, 30)
        poly = [(int(p[0]), int(p[1])) for p in pts] + [(int(pts[0][0]), int(pts[0][1]))]
        d.line(poly, fill=gc, width=1)

# ─── 2. CORNER LABELS ──────────────────────────────────────────────────────────
d.text((M, 74),              "PEPTIDE PRECISION", font=f_mono_sm, fill=GOLD)
d.text((W - M - 118, 74),    "LB-01  ∎  2026",   font=f_mono_sm, fill=GOLD)

# Left margin vertical accent rule
vrule(d, M - 32, 74, GRID_BOTTOM + 60, RULE_FAINT, 1)
# Right margin vertical accent rule
vrule(d, W - M + 32, 74, GRID_BOTTOM + 60, RULE_FAINT, 1)

# ─── 3. LARGE HEXAGONAL MARK ───────────────────────────────────────────────────
CX  = W // 2
CY  = 810
ROT = 30    # flat-top; matches production logo

# Radii — proportional to 1 : 0.714 : 0.463
R1  = 588   # gold outer
R2  = 422   # obsidian middle
R3  = 272   # cream inner
SW  = 90    # stroke weight (heavy, logo-weight)

# Draw order: back-to-front so gold reads dominant (same as logo)
hex_arc(d, CX, CY, R2, ROT, 2, 3, SW, OBSIDIAN)
hex_arc(d, CX, CY, R3, ROT, 4, 3, SW, CREAM_ARC)
hex_arc(d, CX, CY, R1, ROT, 0, 3, SW, GOLD)

# Container reference hexagon (very faint)
cont = hex_pts(CX, CY, R1 + 60, ROT)
for i in range(6):
    p1 = (int(cont[i][0]),       int(cont[i][1]))
    p2 = (int(cont[(i+1)%6][0]), int(cont[(i+1)%6][1]))
    d.line([p1, p2], fill=GOLD_PALE, width=2)

# Vertex ticks on container
for v in cont:
    ang = math.atan2(v[1] - CY, v[0] - CX)
    tx, ty = int(v[0] + 16 * math.cos(ang)), int(v[1] + 16 * math.sin(ang))
    d.line([(int(v[0]), int(v[1])), (tx, ty)], fill=GOLD_MID, width=2)

# 60° angle annotation at top-right vertex
av = cont[0]
al = (int(av[0]) + 60, int(av[1]) - 34)
d.line([(int(av[0]), int(av[1])), al], fill=GOLD_MID, width=2)
d.text((al[0] + 7, al[1] - 14), "60°", font=f_mono_sm, fill=GOLD)

# Horizontal radius annotation
d.line([(CX, CY), (CX + R1 + 62, CY)], fill=GOLD_PALE, width=2)
d.text((CX + R1 + 70, CY - 12), "r", font=f_mono_sm, fill=GOLD_MID)

# Center crosshair (precise, minimal)
dot(d, CX, CY, 4, GOLD_MID)
d.line([(CX - 14, CY), (CX + 14, CY)], fill=GOLD_MID, width=1)
d.line([(CX, CY - 14), (CX, CY + 14)], fill=GOLD_MID, width=1)

# ─── 4. WORDMARK ───────────────────────────────────────────────────────────────
Y_TR = CY + R1 + 110      # top rule

rule(d, Y_TR,        M, W - M, GOLD, 2)

Y_LB = Y_TR + 46
tracked(d, "LURABIO", f_gloock_xl, OBSIDIAN, W // 2, Y_LB, track=28)

LH   = f_gloock_xl.getbbox("LURABIO")[3] - f_gloock_xl.getbbox("LURABIO")[1]
Y_BR = Y_LB + LH + 46

rule(d, Y_BR,        M, W - M, GOLD, 2)

Y_RP = Y_BR + 36
tracked(d, "RESEARCH PEPTIDES", f_work_bold, OBSIDIAN, W // 2, Y_RP, track=14)

RPH  = f_work_bold.getbbox("R")[3] - f_work_bold.getbbox("R")[1]

# Tracking spec annotation (typography detail)
Y_TK = Y_RP + RPH + 22
d.text((W // 2 - 42, Y_TK), "tracking : 0.12em", font=f_mono_sm, fill=GOLD_MID)

# ─── 5. DIVIDER + SECTION HEADER ────────────────────────────────────────────────
Y_DIV = Y_TK + 86

rule(d, Y_DIV, M, W - M, RULE_FAINT, 1)
d.text((M, Y_DIV + 24),         "CATEGORY  SYSTEM", font=f_mono_reg, fill=GOLD)
d.text((W - M - 46, Y_DIV + 24), "∎  6",            font=f_mono_sm,  fill=GOLD)

# ─── 6. CATEGORY SWATCHES ──────────────────────────────────────────────────────
Y_SW   = Y_DIV + 76
SW_W   = 308
SW_H   = 296
GAP_X  = (W - 2*M - 3*SW_W) // 2
GAP_Y  = 56

for i, (col, name, code) in enumerate(CAT):
    r, c = divmod(i, 3)
    sx = M + c * (SW_W + GAP_X)
    sy = Y_SW + r * (SW_H + GAP_Y + 56)

    d.rectangle([sx, sy, sx + SW_W, sy + SW_H], fill=col)

    # Code label above
    d.text((sx, sy - 28), code, font=f_mono_sm, fill=OBSIDIAN)

    # Thin top-edge accent in gold
    d.line([(sx, sy), (sx + SW_W, sy)], fill=GOLD_MID, width=2)

    # Name label below
    d.text((sx, sy + SW_H + 14), name, font=f_mono_sm, fill=OBSIDIAN)

    # Hex value
    hex_val = "#{:02X}{:02X}{:02X}".format(*col)
    d.text((sx, sy + SW_H + 36), hex_val, font=f_mono_sm, fill=(162, 156, 148))

# ─── 7. FOOTER ─────────────────────────────────────────────────────────────────
Y_FT = Y_SW + 2 * (SW_H + GAP_Y + 56) + 78

rule(d, Y_FT, M, W - M, GOLD, 1)

d.text(
    (M, Y_FT + 30),
    "PEPTIDE PRECISION  ∎  LURABIO RESEARCH  ∎  MMXXVI",
    font=f_mono_sm, fill=OBSIDIAN,
)
d.text((W - M - 28, Y_FT + 30), "1.0", font=f_mono_sm, fill=GOLD)

# Bottom margin rule
rule(d, H - 74, M, W - M, RULE_FAINT, 1)

# ═══════════════════════════════════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════════════════════════════════
OUT = "/Users/preye/Documents/poxo/docs/lurabio-brand/lurabio-brand-identity.png"
img.save(OUT, "PNG")

print(f"Saved {W}×{H}px  →  {OUT}")
print(f"Footer Y: {Y_FT}  |  Canvas headroom: {H - Y_FT - 80}px")
