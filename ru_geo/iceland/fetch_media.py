# Скачивает все исходники из MEDIA (Pixabay — по API-ссылкам, Commons — превью 1920 px с thumb.wikimedia.org) в ../data.
import os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from media_list import MEDIA
import sources
sources.fetch(MEDIA)
missing = [k for k, m in MEDIA.items() if not (os.path.exists(os.path.join(sources.DATA, m['file'])) and os.path.getsize(os.path.join(sources.DATA, m['file'])) > 5000)]
print('missing', missing)
