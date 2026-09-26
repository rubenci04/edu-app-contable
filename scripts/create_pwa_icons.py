"""Generate the local PWA icons from the app's existing colors and education mark."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "public" / "icons"
root.mkdir(parents=True, exist_ok=True)

for size in (192, 512, 180):
    scale = 4
    canvas = Image.new("RGBA", (size * scale, size * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    s = size * scale
    draw.rounded_rectangle((0, 0, s - 1, s - 1), radius=s // 5, fill="#2b5146")
    # Graduation cap and open-book lines: kept inside the maskable safe area.
    draw.polygon([(s*.23, s*.39), (s*.5, s*.25), (s*.77, s*.39), (s*.5, s*.53)], fill="#ffffff")
    draw.line([(s*.31, s*.48), (s*.31, s*.61), (s*.5, s*.70), (s*.69, s*.61), (s*.69, s*.48)], fill="#ffffff", width=s//38, joint="curve")
    draw.line([(s*.77, s*.39), (s*.77, s*.63)], fill="#ffffff", width=s//45)
    draw.ellipse((s*.735, s*.62, s*.805, s*.69), fill="#e2c88e")
    draw.line([(s*.25, s*.76), (s*.5, s*.82), (s*.75, s*.76)], fill="#c8dfc4", width=s//55, joint="curve")
    icon = canvas.resize((size, size), Image.Resampling.LANCZOS)
    name = "apple-touch-icon.png" if size == 180 else f"icon-{size}.png"
    icon.save(root / name)
