import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); from tts import run
D = os.path.dirname(os.path.abspath(__file__)); Z='08b267d9a5fb4b6ead23d97878586ee3'; E='f3e4395133974e3e8d49af6e4c66e4a6'; B='685fbf7e5b8a46008c1dee91d782b528'
run([('Сейчас будет кот. Я чувствую.', Z, f'{D}/z_plain.mp3'), ('(whispering) Сейчас будет кот. Я чувствую.', Z, f'{D}/z_whisper.mp3'),
     ('ЭТО МОИ ЦВЕТЫ!', E, f'{D}/e_plain.mp3'), ('(shouting) ЭТО МОИ ЦВЕТЫ!', E, f'{D}/e_shout.mp3'),
     ('(sobbing) My ex left me... for my best friend.', B, f'{D}/b_sob.mp3'), ('(laughing) Онли плэнтс... Эля, прячь фикус.', Z, f'{D}/z_laugh.mp3')])
