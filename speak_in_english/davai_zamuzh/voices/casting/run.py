import sys, os; sys.path.insert(0, '/home/user/wt_dz/speak_in_english/davai_zamuzh/voice'); from tts import run
D = os.path.dirname(os.path.abspath(__file__))
B = ['933563129e564b19a115bedd57b7406a', '85d6a6c915f545b399b0bfb358244fb9', '83c19893c4974594839bd2d101b1fd66', 'f80f728df4c243bca79cd8dd0b57cac4']
Z = ['5178e5641cef4351b03bad85a5ad5a3a', 'e64409e787324864bdf9e5c1b6acd97a', '0ca87517686c4d85a481d2e63ad1397c', '2c9cfca2eb4f4644a2a8e8dd9e107c12']
BL = ['My ex left me… for my best friend. And her cat.', 'I choose… the one who can pay for dinner.']
ZL = ['Девочки… не ссорьтесь. У вас обеих Луна в Скорпионе.', 'Mercury is in retrograde. Never trust crypto in retrograde.']
jobs = [(l, v, f'{D}/b{i+1}_{j+1}.mp3') for i, v in enumerate(B) for j, l in enumerate(BL)] + [(l, v, f'{D}/z{i+1}_{j+1}.mp3') for i, v in enumerate(Z) for j, l in enumerate(ZL)]
run([j for j in jobs if not os.path.exists(j[2])])
