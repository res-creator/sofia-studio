# Studio-audience reactions built from several Fish Audio voices (layered later in prep.py). Max 2 TTS at once.
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voice')); from tts import run
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'crowd')
VOX = ['91ddde4f3d644979be354db0ddc0eec3', '639331681b6f4ca292184860934c626a', '498658f22f3742068edf99d1ceeec5c6', 'ef78a03b36964fa28e2b791dee227391',
       '467e68c990b0404ba54e38bebc4fb5d6', '802e3bc2b27e49c2995d23ef70e6ac89', '37a8e3d321bb42a2aa6ec039a9238e61']
KIND = {'laugh': '(laughing) Ха-ха-ха-ха-ха!', 'aww': '(sad) Ооооох…', 'ooh': '(surprised) Оооо!', 'boo': 'Ууууууу!'}
jobs = [(txt, v, f'{D}/{k}_{i}.mp3') for k, txt in KIND.items() for i, v in enumerate(VOX) if not os.path.exists(f'{D}/{k}_{i}.mp3')]
run(jobs)
