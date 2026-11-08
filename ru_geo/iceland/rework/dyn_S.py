# Тест стиля больших док. каналов (TERRA CORE): название тонкими антиквенными буквами в конце вступления, 3D-глобус с полётом к Исландии,
# единый цвет (GRADE=1 в render). Подключается только при ICE_STYLE=1 — полный фильм не меняется, пока владелица не одобрит.
def apply(ns):
    V, M, SHOTS, INTRO = ns['V'], ns['M'], ns['SHOTS'], ns['INTRO']
    for i, (k, sh) in enumerate(INTRO):          # название больше не в начальной нарезке
        sh.pop('title', None)
    SHOTS.update({
      'a22': V(129822, 'чёрный пляж Рейнисфьяра, волны (дрон)', 'Рейнисфьяра, Исландия', ss=3, tr='fade', cine=dict(text='ИСЛАНДИЯ', t0=0.2)),
      'b01': M('anim_globe', tr='fade'), 'b02': M('anim_globe'), 'b03': M('anim_globe'),
    })
