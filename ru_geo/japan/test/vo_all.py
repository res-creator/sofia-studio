# Одна заявка на весь текст (сервис «Дмитрий» нестабилен на отдельных фразах); границы фраз — из SentenceBoundary.
import asyncio, json, os, sys, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
import edge_tts
D = os.path.dirname(os.path.abspath(__file__))
from script import LINES
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'ru-RU-DmitryNeural'
async def run():
    text = ' '.join(l['text'] for l in LINES)
    c = edge_tts.Communicate(text, VOICE, rate='-10%'); sb = []
    with open(f'{D}/vo/all.mp3', 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'SentenceBoundary': sb.append((ch['offset'] / 1e7, ch['duration'] / 1e7, ch['text']))
    return sb
os.makedirs(f'{D}/vo', exist_ok=True)
for k in range(20):
    try: sb = asyncio.run(run()); break
    except Exception as e: print('retry', type(e).__name__, flush=True); asyncio.run(asyncio.sleep(5))
else: raise SystemExit('failed')
json.dump(sb, open(f'{D}/vo/sentences.json', 'w'), ensure_ascii=False, indent=0)
print(len(sb), round(sb[-1][0] + sb[-1][1], 1))
