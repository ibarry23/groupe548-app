"""Re-process Kling source clips into seamless loops with a long dissolve.
usage: python -I loop.py <project_root> <dl_dir> name=source[:fade] ...
  name   -> public/video/<name>.mp4 (+ poster: img/hero-poster.jpg for 'hero', else img/photos/<name>-poster.jpg)
  source -> <dl_dir>/<source>-kling.mp4
  fade   -> dissolve length in seconds (default 1.0)
Also refreshes img/thumbs/<name>.jpg and <name>-lg.jpg for service clips.
"""
import os, subprocess, sys
from PIL import Image

root, dl = sys.argv[1], sys.argv[2]
SERVICES = {'residential-cleaning', 'commercial-cleaning', 'post-construction-cleaning', 'window-cleaning', 'moving', 'transport-delivery', 'interior-painting'}

def run(args):
    subprocess.run(args, check=True, capture_output=True)

for spec in sys.argv[3:]:
    name, rest = spec.split('=', 1)
    src_name, _, fade = rest.partition(':')
    xf = float(fade) if fade else 1.0
    src = os.path.join(dl, src_name + '-kling.mp4')
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip()
    dur = float(probe)
    main_len = dur - xf
    out = os.path.join(root, 'public', 'video', name + '.mp4')
    scale = 'scale=720:-2'
    # main = clip[xf..end]; tail = clip[0..xf] dissolved onto the end of main, so the last frame == the first frame.
    fc = (f"[0:v]split[a][b];[a]trim={xf}:{dur},setpts=PTS-STARTPTS,{scale}[m];"
          f"[b]trim=0:{xf},setpts=PTS-STARTPTS,{scale}[t];"
          f"[m][t]xfade=transition=fade:duration={xf}:offset={main_len - xf},fps=24,format=yuv420p[v]")
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-profile:v', 'main', '-movflags', '+faststart', out])
    poster = os.path.join(root, 'public', 'img', 'hero-poster.jpg') if name == 'hero' else os.path.join(root, 'public', 'img', 'photos', name + '-poster.jpg')
    run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-vf', 'select=eq(n\\,0)', '-frames:v', '1', '-q:v', '4', poster])
    if name in SERVICES:
        im = Image.open(poster).convert('RGB')
        w, h = im.size
        s = min(w, h)
        sq = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
        sq.resize((192, 192), Image.LANCZOS).save(os.path.join(root, 'public', 'img', 'thumbs', name + '.jpg'), quality=80, optimize=True)
        sq.resize((360, 360), Image.LANCZOS).save(os.path.join(root, 'public', 'img', 'thumbs', name + '-lg.jpg'), quality=78, optimize=True)
    print(f'{name}: {dur:.2f}s source, {xf}s dissolve -> {os.path.getsize(out) // 1024} KB')
