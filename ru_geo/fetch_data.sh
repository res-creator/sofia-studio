#!/bin/sh
# Скачивает всё, что не хранится в git (большие файлы), в ru_geo/data. Запуск из корня репо: sh ru_geo/fetch_data.sh
set -e
D=$(cd "$(dirname "$0")" && pwd)/data; mkdir -p "$D/clips" "$D/music"; cd "$D"
NE=https://naciscdn.org/naturalearth
for z in 10m/cultural/ne_10m_admin_0_countries 10m/physical/ne_10m_land; do
  n=$(basename $z); [ -d $n ] || { curl -sSO $NE/$z.zip; mkdir -p $n; unzip -q -o $n.zip -d $n; rm $n.zip; }
done
if [ ! -s eur_hr.png ]; then   # рельеф Natural Earth I (HR), вырезка: долгота -30..70, широта 30..80
  curl -sSO $NE/10m/raster/NE1_HR_LC_SR_W.zip; unzip -q -o NE1_HR_LC_SR_W.zip -d ne1; rm NE1_HR_LC_SR_W.zip
  python3 -c "
from PIL import Image; Image.MAX_IMAGE_PIXELS=None
im=Image.open('ne1/NE1_HR_LC_SR_W.tif'); W,H=im.size; lon0,lon1,lat0,lat1=-30,70,30,80
im.crop((int((180+lon0)/360*W),int((90-lat1)/180*H),int((180+lon1)/360*W),int((90-lat0)/180*H))).save('eur_hr.png')"
  rm -rf ne1
fi
[ -s Montserrat.ttf ] || curl -sSL -o Montserrat.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf"
[ -s Caveat.ttf ] || curl -sSL -o Caveat.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/Caveat%5Bwght%5D.ttf"
[ -s music/mixkit_188_echoes.mp3 ] || curl -sS -o music/mixkit_188_echoes.mp3 https://assets.mixkit.co/music/188/188.mp3
# видео Mixkit (720p), id берутся из всех script.py
for i in $(grep -ho 'clip=[0-9]*' "$D"/../*/script.py | cut -d= -f2 | sort -u); do
  [ -s clips/$i.mp4 ] || curl -sS -o clips/$i.mp4 https://assets.mixkit.co/videos/$i/$i-720.mp4
done
echo "data ok: $D"
