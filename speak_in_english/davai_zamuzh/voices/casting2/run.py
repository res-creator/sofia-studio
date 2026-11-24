import sys, os; sys.path.insert(0, '/home/user/wt_dz/speak_in_english/davai_zamuzh/voice'); from tts import run
D = os.path.dirname(os.path.abspath(__file__))
Z = ['20c91419e7184ac7b4fa4ea5dce1f4e0', 'f83fb0429ca54538a7b167bf70a360c9', 'aa615eaff73f417e91cfbb4ea0e42df8', '465d26b9c1404fd8b020440ce86ae862', 'a1170ec238e64dff86b9fe8259d252d3']
ZL = ['Девочки… не ссорьтесь. У вас обеих Луна в Скорпионе.', 'Mercury is in retrograde. Never trust crypto in retrograde.']
run([(l, v, f'{D}/z{i+1}_{j+1}.mp3') for i, v in enumerate(Z) for j, l in enumerate(ZL) if not os.path.exists(f'{D}/z{i+1}_{j+1}.mp3')])
