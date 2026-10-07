"""Create square Versa brand icons from the connector's bundled wordmark."""
from pathlib import Path

from PIL import Image, ImageDraw


ASSETS = Path(__file__).parent / "assets"
wordmark = Image.open(ASSETS / "logo-connector.png").convert("RGBA")
mark_size = min(wordmark.height, wordmark.width)
mark = wordmark.crop((0, 0, mark_size, mark_size))

# Keep the Versa monogram crisp and recognizable in the Windows title bar,
# Start menu, taskbar, and notification area at small icon sizes.
canvas = Image.new("RGBA", (256, 256), (255, 255, 255, 0))
draw = ImageDraw.Draw(canvas)
draw.ellipse((4, 4, 252, 252), fill="#FFFFFF", outline="#008F4C", width=8)
mark.thumbnail((174, 174), Image.Resampling.LANCZOS)
canvas.alpha_composite(mark, ((256 - mark.width) // 2, (256 - mark.height) // 2))
canvas.save(ASSETS / "versa-icon.png")
canvas.save(ASSETS / "versa-icon.ico", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
