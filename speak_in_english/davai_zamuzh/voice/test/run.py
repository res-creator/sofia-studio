import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); from tts import run
D = os.path.dirname(os.path.abspath(__file__))
E = 'Бриттани, почему такая красивая девушка до сих пор одна?'; S = 'Brittany, you are a Leo. A Leo needs... a king. Звёзды уже всё знают.'
run([(E, '65204011d01247c19c987b651900651e', f'{D}/e_strict.mp3'), (E, 'f3e4395133974e3e8d49af6e4c66e4a6', f'{D}/e_prof.mp3'), (E, '498658f22f3742068edf99d1ceeec5c6', f'{D}/e_50.mp3'),
     (S, '4b158b9042f14a9f8d2e98c1c34ae85c', f'{D}/s_myst.mp3'), (S, '5c48b495ee1544dba8fdb65624680e59', f'{D}/s_echo.mp3'), (S, 'f54b5afb23f64ed8a8fcf642c11dc30a', f'{D}/s_dream.mp3'),
     ("Hi! I'm Mike. I'm a freelancer, I'm my own boss!", '467e68c990b0404ba54e38bebc4fb5d6', f'{D}/m_nerd.mp3'), ("Hi! I'm Josh. I'm vegan. I brought you kale!", '711cf3ed00ab441a8f54a45058047b7a', f'{D}/j_verity.mp3'),
     ("I'm Ryan. Crypto investor. I'm a millionaire!", '802e3bc2b27e49c2995d23ef70e6ac89', f'{D}/r_energetic.mp3'), ("Hi! I'm Josh. I'm vegan. I brought you kale!", '467e68c990b0404ba54e38bebc4fb5d6', f'{D}/j_nerd.mp3')])
