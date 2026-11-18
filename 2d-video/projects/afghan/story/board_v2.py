# Раскадровка v2 (движение уровня референсов). Все времена абсолютные, берутся из слов озвучки: w('слово', после).
# Каждый пункт перечисления = своё событие на его слове; числа = счётчики; эмоция = реакция; кадр ≤ 4 с.
RANGES = []          # отрезки [a, b), где старые шоты заменяются этими
def kv(*pairs, d=0.3): return {'kv': [list(p) for p in pairs], 'd': d}

def build(add, w):
    V = lambda at, tr=None, **p: add(at, 'v2', tr, **p)
    HER, AUNT, NB = 'heroine', 'aunt', 'neighbor'
    # ================================================================ 25 ЛЕТ. ЗЕРКАЛО ПОД ТКАНЬЮ (434.09 … 502.69)
    a0 = 434.09; RANGES.append((a0, 550.16))
    V(a0, 'whip2', bg='black', fx=[['count', a0 + 0.15, 18, 25, 960, 360, {'size': 150, 'suf': ' лет', 'dur': 0.8}], ['card', 'Зеркало под тканью', a0 + 0.6, 960, 600, 120]], mv={'r': 0.03}, vig=0,
      sfx=[[a0 + 0.15, 'counter', -14], [a0, 'swish', -10]])
    t = 436.72  # «Ты хочешь работать.» — героиня входит в кадр с папкой
    V(t, bg='street', figs=[[900, 1000, 0.8, HER, {'walk': {'x0': -250, 'x1': 900, 'at': t, 'dur': 1.3}, 'holdR': 'folder', 'pose': 'hold', 'exprs': [[0, 'focus'], [w('работать', t), 'smile']], 'nods': [w('работать', t) + 0.1]}]],
      fx=[['ptag', '25 лет', 230, 150, t + 0.1, {'size': 70, 'bg': '#ffd43b'}]], mv={'r': 0.04, 'kick': 1, 'kx': -30})
    t = 438.6   # НКО: две панели падают на «благотворительных» и «гуманитарных», печати на «нельзя»
    n1, n2, nz = w('благотворительных', t), w('гуманитарных', t), w('нельзя', t)
    V(t, bg='color', bo={'col': '#2a2638'}, panels=[
        {'at': n1 - 0.05, 'x': 70, 'y': 150, 'w': 870, 'h': 640, 'bg': 'office', 'bo': {'flag': '#ffffff', 'sym': 'heart', 'boxes': 1}},
        {'at': n2 - 0.05, 'x': 980, 'y': 150, 'w': 870, 'h': 640, 'bg': 'aid'}],
      fx=[['stamp', nz, 505, 470, 150], ['stamp', nz + 0.12, 1415, 470, 150], ['ptxt', 'НКО: нельзя', 960, 930, 120, nz, {'col': '#ffffff'}]],
      mv={'r': 0.035}, sfx=[[n1, 'whoosh', -14, 0.35], [n2, 'whoosh', -14, 0.35], [nz, 'hit', -10], [nz + 0.12, 'hit', -12]])
    t = 443.7   # ООН: пропуск перечёркнут, реакция
    nz = w('нельзя', t); un = w('ООН', t)
    V(t, bg='office', bo={'flag': '#6aaee6', 'sym': 'circle'}, figs=[[640, 1010, 0.85, HER, {'exprs': [[0, 'worried'], [nz + 0.1, 'sad']], 'look': 1, 'sweatAt': nz + 0.2, 'pose': 'idle'}]],
      fx=[['badge', 1180, 560, 1.3, '#6aaee6'], ['stamp', nz, 1180, 600, 170], ['ptag', 'ООН', 1650, 140, un, {'size': 84, 'bg': '#bfe0f6'}]], mv={'r': 0.05, 'kick': 1, 'kx': 25},
      sfx=[[nz, 'hit', -9]])
    t = 446.55  # «Ещё до курсов твоя тётя…» — прошлое (сепия): тётя идёт к салону
    V(t, 'dipWhite', bg='salonRow', bo={'shut': [0, 0, 0]}, figs=[[960, 1010, 0.62, AUNT, {'walk': {'x0': 2100, 'x1': 960, 'at': t, 'dur': 1.5}, 'holdR': 'handbag', 'expr': 'smile'}]],
      fx=[['ptag', 'раньше', 960, 150, w('курсов', t), {'size': 74, 'bg': '#f6efdc'}]], tint='sepia', mv={'r': 0.04, 'px': -25})
    t = 448.5   # салон изнутри: тётя делает укладку феном
    s1 = w('салоне', t)
    V(t, bg='salonIn', figs=[[700, 1010, 0.82, AUNT, {'pose': 'cut', 'holdR': 'dryerOn', 'expr': 'smile', 'look': 1, 'nods': [449.3]}]], fx=[['client', 1100, 1010, 0.82, {'wind': 1}], ['ptag', 'салон красоты', 960, 150, s1, {'size': 76}]],
      tint='sepia', mv={'r': 0.05, 'kick': 1, 'kx': 30}, sfx=[[s1, 'pop', -14]])
    t = 450.6   # «одна из последних работ» — клиентка платит
    pay = w('последних', t)
    V(t, bg='salonIn', figs=[[700, 1010, 0.85, AUNT, {'poses': [[0, 'idle'], [pay + 0.1, 'reach']], 'holdKeys': [[0, None], [pay + 0.25, 'money']], 'expr': 'smile', 'look': 1}],
                             [1180, 1010, 0.85, NB, {'flip': True, 'poses': [[0, 'hold']], 'holdKeys': [[0, 'money'], [pay + 0.25, None]], 'look': -1, 'expr': 'smile'}]],
      view=[960, 640, 1.15], tint='sepia', mv={'r': 0.045})
    t = 452.9   # «где женщина зарабатывала сама» — радость, звёзды
    sm = w('сама', t)
    V(t, bg='salonIn', figs=[[960, 1010, 1.05, AUNT, {'pose': 'up', 'holdR': 'money', 'exprs': [[0, 'smile'], [sm, 'laugh']], 'jumpAt': sm}]], view=[960, 560, 1.25],
      fx=[['burst', sm, 1160, 420, 'stars', {'n': 22}], ['ptag', 'свои деньги', 960, 150, w('зарабатывала', t), {'size': 76, 'bg': '#ffd43b'}]], tint='sepia', mv={'r': 0.05}, sfx=[[sm, 'ding', -16]])
    t = 454.95  # «Летом 2023 все салоны закрыли» — ставни падают одна за другой
    z = w('закрыли', t)
    V(t, 'whip2', bg='salonRow', bo={'shut': [kv([0, 0], [z, 1], d=0.22), kv([0, 0], [z + 0.2, 1], d=0.22), kv([0, 0], [z + 0.4, 1], d=0.22)]},
      fx=[['ptag', 'лето 2023', 960, 150, w('Летом', t), {'size': 80, 'bg': '#ffd43b'}]], mv={'r': 0.03, 'shake': [[z - t + 0.2, 9], [z - t + 0.4, 9], [z - t + 0.6, 12]]},
      sfx=[[t, 'swish', -10], [z + 0.2, 'hit', -9], [z + 0.4, 'hit', -9], [z + 0.6, 'hit', -8]])
    t = 458.1   # 60 000 женщин без работы: счётчик + человечки заполняются
    c = w('шестидесяти', t)
    V(t, bg='icons', bo={'n': 60, 'rows': 5, 'frac': 1.0, 'col': '#c84a6a', 'at': c - 0.1}, fx=[['ptag', 'без работы', 960, 150, t + 0.1, {'size': 80}], ['count', c, 0, 60000, 960, 140, {'size': 150, 'pre': '≈ ', 'dur': 1.3, 'unit': 'женщин без работы', 'uy': 690, 'usize': 80, 'ucol': '#ffd43b'}]],
      mv={'r': 0.035, 'kick': 1}, sfx=[[c, 'counter', -14]])
    t = 462.4   # «Тётя завесила зеркало тканью» — ткань падает на зеркало
    cl = w('тканью', t)
    V(t, bg='kitchen', bo={'cover': kv([0, 0], [cl - 0.15, 1], d=0.35)}, figs=[[600, 980, 0.85, AUNT, {'poses': [[0, 'up'], [cl + 0.2, 'idle']], 'holdKeys': [[0, 'cloth'], [cl - 0.15, None]], 'look': 1, 'expr': 'sad'}]],
      mv={'r': 0.05, 'kick': 1, 'ky': 20}, sfx=[[cl - 0.15, 'whoosh', -16, 0.4]])
    t = 464.3   # «И стала стричь соседок» — ножницы, волосы падают
    s0 = w('стричь', t)
    V(t, bg='kitchen', figs=[[760, 1000, 0.85, AUNT, {'pose': 'cut', 'holdR': 'scissors', 'snip': [[s0, 467.0]], 'expr': 'focus', 'look': 1}]], fx=[['client', 1060, 1000, 0.85, {}], ['burst', [s0 + 0.1, s0 + 0.5, s0 + 0.9, s0 + 1.3, s0 + 1.7], 990, 560, 'hair', {'n': 8, 'speed': 120, 'grav': 900, 'spread': 2.4, 'dir': 1.57}]],
      view=[920, 600, 1.55], mv={'r': 0.05, 'kick': 1, 'kx': 25})
    t = 466.5   # «у себя на кухне. По знакомству» — соседка входит, тётя машет
    zn = w('знакомству', t)
    V(t, bg='kitchen', figs=[[620, 980, 0.8, AUNT, {'poses': [[0, 'cut'], [zn + 0.2, 'wave']], 'holdR': 'scissors', 'snip': [[t, zn]], 'expr': 'smile', 'lookKeys': [[0, 1], [zn, 1]]}],
                             [1500, 980, 0.8, 'neighbor', {'walk': {'x0': 2150, 'x1': 1500, 'at': zn - 0.4, 'dur': 0.9}, 'scarf': '#5a8a4a', 'coat': '#3a5a3a', 'shirt': '#3a5a3a', 'expr': 'smile', 'seed': 31, 'look': -1}]],
      fx=[['client', 920, 980, 0.8, {}]], mv={'r': 0.035, 'px': 30})
    t = 468.5   # «Тихо.» — палец у губ
    V(t, bg='kitchen', figs=[[960, 1000, 1.0, AUNT, {'poses': [[0, 'idle'], [t + 0.1, 'hush']], 'expr': 'worried', 'look': 0}]], view=[960, 470, 1.9], mv={'r': 0.06, 'kick': 1})
    t = 469.4   # «Она стрижёт их до сих пор» — часы бегут
    V(t, bg='kitchen', figs=[[700, 980, 0.8, AUNT, {'pose': 'cut', 'holdR': 'scissors', 'snip': [[t, 471.5]], 'expr': 'focus', 'look': 1}]], fx=[['client', 1000, 980, 0.8, {'hairC': '#5a3a22'}], ['clockspin', 1600, 260, 110, t + 0.3, 2.0], ['burst', [t + 0.4, t + 1.0, t + 1.6], 930, 560, 'hair', {'n': 7, 'speed': 120, 'grav': 900, 'dir': 1.57, 'spread': 2.4}]],
      mv={'r': -0.04})
    t = 471.5   # «Теперь и ты помогаешь ей»
    V(t, bg='kitchen', figs=[[560, 980, 0.8, AUNT, {'pose': 'cut', 'holdR': 'scissors', 'expr': 'smile', 'lookKeys': [[0, 1]], 'nods': [472.6]}], [1400, 980, 0.8, HER, {'walk': {'x0': 2150, 'x1': 1400, 'at': t, 'dur': 0.9}, 'expr': 'smile', 'look': -1}]],
      fx=[['client', 860, 980, 0.8, {}]], mv={'r': 0.045, 'kick': 1, 'kx': -25})
    t = 473.05  # «держишь фен»
    V(t, bg='salonIn', figs=[[760, 1000, 0.95, HER, {'pose': 'cut', 'holdR': 'dryerOn', 'expr': 'focus', 'look': 1}]], fx=[['client', 1130, 1000, 0.95, {'wind': 1, 'shut': True}]], view=[960, 560, 1.5],
      mv={'r': 0.07, 'kick': 1}, sfx=[[t, 'hum', -24, 0.8]])
    t = 473.85  # «подметаешь волосы»
    V(t, bg='kitchen', figs=[[900, 990, 0.9, HER, {'poses': [[0, 'sweep'], [t + 0.3, [[20, -210, 1], [100, -230, -1]]], [t + 0.6, 'sweep'], [t + 0.9, [[20, -210, 1], [100, -230, -1]]]], 'holdR': 'broom', 'expr': 'smile', 'lookY': 0.6, 'look': 1}]],
      fx=[['burst', [t + 0.3, t + 0.9], 1080, 960, 'dust', {'n': 14, 'speed': 260, 'grav': 200, 'dir': -0.4, 'spread': 1.2}]], view=[960, 700, 1.25], mv={'r': 0.05, 'px': -30})
    t = 475.1   # «учишься» — сама держит ножницы, тётя кивает
    V(t, bg='kitchen', figs=[[1250, 980, 0.85, AUNT, {'pose': 'point', 'flip': True, 'expr': 'smile', 'look': -1, 'nods': [475.4]}], [700, 980, 0.85, HER, {'pose': 'cut', 'holdR': 'scissors', 'snip': [[475.3, 476.0]], 'expr': 'focus', 'look': 1}]],
      fx=[['client', 1000, 980, 0.85, {}], ['burst', 475.3, 1000, 400, 'sparkle', {'n': 10, 'size': 16}]], mv={'r': 0.05, 'kick': 1})
    t = 476.0   # «Работы мало у всех» — мужчины ждут у стены
    V(t, 'whip2', bg='laborWall', under=[['shovel', 520, 760], ['shovel', 1440, 760]], figs=[[400, 900, 0.72, 'husband', {'seated': True, 'expr': 'tired', 'holdR': 'toolbag', 'pose': 'hold'}], [760, 900, 0.72, 'brother', {'expr': 'worried', 'look': 0.5, 'shakes': [476.9]}],
        [1120, 900, 0.72, 'father', {'seated': True, 'expr': 'tired', 'look': -0.5}], [1500, 900, 0.72, 'mstudent', {'expr': 'sad', 'pose': 'hips'}]], mv={'r': 0.03, 'px': 40}, sfx=[[t, 'swish', -10]])
    t = 477.8   # «По оценке ООН, в 2026 году помощь нужна…»
    V(t, bg='aid', fx=[['ptag', 'оценка ООН', 960, 150, w('оценке', t), {'size': 76, 'bg': '#bfe0f6'}], ['ptxt', '2026', 960, 340, 170, w('шестом', t) - 0.3, {'col': '#ffd43b'}]], mv={'r': 0.045, 'kick': 1})
    t = 480.3   # «почти каждому второму жителю страны» — каждому второму падает коробка помощи
    k2 = w('каждому', t)
    V(t, bg='map', bo={'view': [58.5, 28.6, 76.5, 39.4], 'hl': {'AFG': '#e9c98a'}}, under=[['dim', [[0, 0.35]]]],
      fx=[['iconrow', 10, 285, 760, 150, 1.25, {'hi': [0, 2, 4, 6, 8], 'at': k2, 'step': 0.12, 'box': 1, 'col': '#3a6aa8', 'off': '#e8e0d0'}], ['ptxt', '≈ 1 из 2', 960, 300, 180, w('второму', t), {'col': '#ffd43b'}], ['ptag', 'Афганистан, 2026', 960, 140, t + 0.1, {'size': 70}]],
      mv={'r': 0.04}, sfx=[[k2 + 0.12 * j, 'pop', -16] for j in range(5)])
    t = 483.7   # «Твой брат тоже ищет работу» — идёт с инструментом, стучит в двери
    kn = w('работу', t)
    V(t, bg='street', bo={'passers': True}, figs=[[1180, 1010, 0.82, 'brother', {'walk': {'x0': -250, 'x1': 1180, 'at': t, 'dur': 1.4}, 'holdR': 'toolbag', 'poses': [[0, 'hold'], [kn, 'knock'], [kn + 0.7, 'hold']], 'expr': 'focus', 'look': 1, 'beard': True}]],
      fx=[['knock', [kn + 0.15, kn + 0.4], 1330, 640]], mv={'r': 0.03, 'px': 45}, sfx=[[kn + 0.15, 'hit', -20], [kn + 0.4, 'hit', -20]])
    t = 485.85  # «Но у него хотя бы есть право её искать» — сплит: брат на улице / героиня у окна
    pr = w('право', t)
    V(t, bg='color', bo={'col': '#1e1a26'}, panels=[
        {'at': t, 'x': 60, 'y': 120, 'w': 880, 'h': 780, 'bg': 'street', 'bo': {'passers': False}, 'figs': [[960, 1010, 1.0, 'brother', {'pose': 'hold', 'holdR': 'toolbag', 'expr': 'smile', 'beard': True, 'look': 0.3}]], 'fy': 640},
        {'at': w('хотя', t), 'x': 980, 'y': 120, 'w': 880, 'h': 780, 'bg': 'room', 'figs': [[960, 980, 1.0, HER, {'expr': 'sad', 'look': 1, 'lookY': -0.3, 'tilt': 0.08}]], 'fy': 640}],
      fx=[['ok', pr, 500, 260, 100], ['stamp', pr + 0.25, 1420, 260, 90]], mv={'r': 0.03}, sfx=[[pr, 'ding', -18], [pr + 0.25, 'hit', -16]])
    t = 488.8   # «Отдыхать тоже почти негде» — вздох у окна
    V(t, bg='room', figs=[[900, 900, 1.0, HER, {'seated': True, 'expr': 'tired', 'lookKeys': [[0, 1]], 'lookY': -0.4, 'turn': 0.3, 'nods': [490.0]}]], view=[1000, 560, 1.35], mv={'r': -0.035})
    t = 490.7   # «Женщинам нельзя в парки, спортзалы и общественные бани» — 3 панели по словам, крест на каждой
    p1, p2, p3 = w('парки', t), w('спортзалы', t), w('общественные', t)
    V(t, 'drop', bg='color', bo={'col': '#2a2638'}, panels=[
        {'at': p1, 'x': 50, 'y': 270, 'w': 590, 'h': 560, 'bg': 'park'}, {'at': p2, 'x': 665, 'y': 270, 'w': 590, 'h': 560, 'bg': 'gym'}, {'at': p3, 'x': 1280, 'y': 270, 'w': 590, 'h': 560, 'bg': 'baths'}],
      fx=[['ptxt', 'женщинам нельзя', 960, 150, 110, w('нельзя', t), {'col': '#ffffff'}], ['stamp', p1 + 0.4, 345, 550, 130], ['stamp', p2 + 0.45, 960, 550, 130], ['stamp', w('бани', t) + 0.3, 1575, 550, 130],
          ['ptag', 'парки', 345, 930, p1, {'size': 72}], ['ptag', 'спортзалы', 960, 930, p2, {'size': 72}], ['ptag', 'бани', 1575, 930, p3, {'size': 72}]],
      mv={'r': 0.025}, sfx=[[t, 'whoosh', -14, 0.4], [p1 + 0.4, 'hit', -12], [p2 + 0.45, 'hit', -12], [w('бани', t) + 0.3, 'hit', -11]])
    t = 494.85  # «уехать дальше 72 км от дома» — Кабул, круг 72 км растёт со счётчиком
    c = w('семидесяти', t)
    V(t, 'whip2', bg='afgMap', bo={'k': kv([0, 0], [c, 1], d=1.1), 'pinAt': t - 494.85 + 0.15}, fx=[['count', c, 0, 72, 640, 330, {'size': 130, 'suf': ' км', 'dur': 1.1, 'unit': 'от дома', 'usize': 70}]],
      mv={'r': 0.09, 'cx': 1127, 'cy': 487, 'kick': 1}, sfx=[[t, 'swish', -10], [c, 'counter', -15]])
    t = 497.3   # «можно только с мужчиной из семьи» — водитель качает головой, брат подходит, водитель кивает
    mz = w('мужчиной', t)
    V(t, bg='busStop', bo={'driver': {'hair': 'side', 'hairC': '#2a2320', 'body': 'perahan', 'coat': '#b8a888', 'vest': '#4a4a3a', 'beard': True, 'skin': '#d8a070', 'seed': 90, 'expr': 'neutral', 'look': 1, 'noShadow': True}},
      figs=[[1520, 1000, 0.75, HER, {'holdR': 'handbag', 'pose': 'hold', 'exprs': [[0, 'focus'], [t + 0.9, 'sad'], [mz + 0.6, 'smile']], 'look': -1}], [1260, 1000, 0.8, 'brother', {'walk': {'x0': -300, 'x1': 1260, 'at': mz - 0.5, 'dur': 0.8}, 'beard': True, 'expr': 'smile', 'look': 1}]],
      fx=[['ptxt', 'нет', 1310, 380, 100, t + 0.7, {'col': '#e2483a', 'until': mz - 0.3}], ['ok', mz + 0.6, 1310, 400, 80]], mv={'r': 0.035, 'px': -30}, sfx=[[mz + 0.6, 'ding', -18]])
    t = 500.0   # «как из Москвы до Сергиева Посада»
    VW = [36.6, 55.3, 39.0, 56.7]
    V(t, bg='map', bo={'view': VW, 'labels': [['Подмосковье', 38.6, 55.6, 60]]}, fx=[['pin', VW, 37.62, 55.75, w('Москвы', t), 'Москва'], ['pin', VW, 38.13, 56.31, w('Сергиева', t), 'Сергиев Посад'], ['route', VW, [37.62, 55.75], [38.13, 56.31], w('Сергиева', t) + 0.1, 0.8, '72 км']],
      mv={'r': 0.045, 'kick': 1})
    # ================================================================ 40 ЛЕТ. ТИХИЙ ГОЛОС
    t = 502.69
    V(t, 'whip2', bg='black', fx=[['count', t + 0.15, 25, 40, 960, 360, {'size': 150, 'suf': ' лет', 'dur': 0.9}], ['card', 'Тихий голос', t + 0.7, 960, 600, 120]], mv={'r': 0.03}, vig=0, sfx=[[t + 0.15, 'counter', -14], [t, 'swish', -10]])
    t = 505.32  # «Тебе сорок.»
    V(t, bg='room', figs=[[960, 1000, 0.95, HER, {'expr': 'smile', 'nods': [506.1], 'look': 0.3}]], view=[960, 600, 1.3], mv={'r': 0.05, 'kick': 1})
    t = 506.45  # «Твоей дочери двенадцать» — дочь вбегает и подпрыгивает
    d12 = w('двенадцать', t)
    V(t, bg='room', figs=[[700, 1000, 0.85, HER, {'expr': 'smile', 'lookKeys': [[0, 1]], 'pose': 'hips'}], [1220, 1000, 0.72, 'girl', {'walk': {'x0': 2150, 'x1': 1220, 'at': t + 0.05, 'dur': 0.7}, 'expr': 'laugh', 'pack': '#3a6aa8', 'look': -1, 'jumpAt': [d12 + 0.1], 'poses': [[0, 'idle'], [d12, 'cheer']]}]],
      fx=[['ptag', '12 лет', 1220, 260, d12, {'size': 76, 'bg': '#ffd43b'}], ['burst', d12 + 0.15, 1220, 420, 'stars', {'n': 14}]], mv={'r': 0.04, 'px': 30})
    t = 508.1   # «Её последний звонок уже скоро» — дни листаются к дню звонка
    zv = w('звонок', t)
    V(t, bg='calFlip', bo={'n': kv([0, 0], [t, 23], d=1.0), 'circ': [[23, zv - t]]}, view=[960, 600, 0.86], fx=[['bell', zv, 1600, 200, 1.1], ['ptag', 'последний звонок', 960, 970, zv, {'size': 64, 'bg': '#ffd43b'}]],
      mv={'r': 0.03, 'kick': 1}, sfx=[[zv, 'ding', -14]])
    t = 509.5   # объятие (реакция)
    V(t, bg='room', figs=[[820, 1000, 0.95, HER, {'pose': 'hug', 'expr': 'worried', 'eyesShut': True, 'turn': 0.4}], [1080, 1000, 0.75, 'girl', {'expr': 'calm', 'pose': 'hug', 'flip': True, 'turn': 0.4}]], view=[950, 600, 1.3], tint='pink', mv={'r': 0.05})
    t = 510.25  # «В 2024 году приняли закон» — печать
    pz = w('приняли', t)
    V(t, 'impact', bg='lawDesk', fx=[['ptxt', '2024', 960, 230, 190, w('четвёртом', t) - 0.2, {'col': '#ffffff'}], ['circle', pz, 1240, 760, 120, '#c23a2c'], ['ptxt', 'ЗАКОН', 1240, 760, 90, pz, {'col': '#c23a2c', 'rot': -0.2}]],
      mv={'r': 0.04, 'shake': [[pz - t, 12]]}, sfx=[[t, 'hit', -10], [pz, 'impact', -14]])
    t = 512.8   # название закона печатается в такт голосу
    V(t, bg='lawDesk', fx=[['type', 'о поощрении добродетели', 960, 380, 100, w('поощрении', t) - 0.25, {'stroke': False, 'col': '#2a2321'}], ['type', 'и предотвращении порока', 960, 560, 100, w('предотвращении', t) - 0.3, {'stroke': False, 'col': '#2a2321'}]],
      mv={'r': 0.035, 'px': 20})
    t = 516.75  # «На улице женщина должна закрывать лицо» — идут, ткань поднимается на лицо
    cz = w('закрывать', t)
    V(t, bg='street', bo={'passers': True}, figs=[[780, 1010, 0.82, HER, {'walk': {'x0': -150, 'x1': 780, 'at': t, 'dur': 1.5}, 'veilKeys': [[0, 0], [cz, 1]], 'veilC': '#3a3a4a', 'scarf': '#3a3a4a', 'exprs': [[0, 'neutral'], [cz + 0.5, 'sad']], 'lookY': 0.2}],
                                                   [1080, 1010, 0.82, NB, {'walk': {'x0': 150, 'x1': 1080, 'at': t, 'dur': 1.5}, 'veilKeys': [[0, 0], [cz + 0.15, 1]], 'veilC': '#3a3a4a', 'scarf': '#3a3a4a', 'exprs': [[0, 'neutral'], [cz + 0.5, 'sad']], 'lookY': 0.2}]],
      mv={'r': 0.04, 'py': -15})
    t = 519.65  # «А её голос… нужно скрывать» — поёт, ноты; на «скрывать» рука к губам
    sk = w('скрывать', t)
    V(t, bg='room', bo={'night': 1}, figs=[[960, 960, 1.05, HER, {'seated': True, 'mouthKeys': [[0, 1], [sk, 0]], 'exprs': [[0, 'calm'], [sk, 'sad']], 'poses': [[0, 'idle'], [sk, 'hush']], 'look': 0.2}]],
      fx=[['burst', [t + 0.2, t + 0.8, t + 1.4, t + 2.0], 1080, 480, 'notes', {'n': 3, 'speed': 260, 'grav': -60, 'dir': -0.9, 'spread': 0.9, 'size': 22, 'life': 1.4}]], view=[960, 560, 1.4], mv={'r': 0.05, 'kick': 1}, sfx=[[sk, 'swish', -18]])
    t = 523.05  # «петь или читать стихи вслух» — две панели
    V(t, bg='color', bo={'col': '#1e1a26'}, panels=[
        {'at': w('петь', t) - 0.05, 'x': 80, 'y': 160, 'w': 860, 'h': 640, 'bg': 'room', 'bo': {'night': 1}, 'figs': [[960, 1000, 1.0, HER, {'seated': True, 'mouth': 0.7, 'expr': 'calm'}]], 'fy': 600},
        {'at': w('читать', t), 'x': 980, 'y': 160, 'w': 860, 'h': 640, 'bg': 'room', 'bo': {'night': 1}, 'figs': [[960, 1000, 1.0, HER, {'seated': True, 'pose': 'hold', 'holdR': 'book', 'talk': True, 'expr': 'focus', 'lookY': 0.5}]], 'fy': 600}],
      fx=[['ptag', 'петь', 510, 900, w('петь', t), {'size': 76}], ['ptag', 'стихи', 1410, 900, w('стихи', t), {'size': 76}], ['burst', [w('петь', t) + 0.1, w('петь', t) + 0.6], 560, 360, 'notes', {'n': 4, 'speed': 200, 'grav': -40, 'dir': -1.2, 'spread': 1.0, 'size': 20, 'life': 1.2}]], mv={'r': 0.03},
      sfx=[[w('петь', t), 'whoosh', -16, 0.35], [w('читать', t), 'whoosh', -16, 0.35]])
    t = 525.0   # «при чужих нельзя» — стук в дверь, рука закрывает рот
    nz = w('нельзя', t)
    V(t, bg='door', bo={'open': 0}, figs=[[420, 1000, 0.9, HER, {'poses': [[0, 'idle'], [nz - 0.1, 'hush']], 'exprs': [[0, 'shock'], [nz, 'sad']], 'look': 1, 'sweatAt': nz}]],
      fx=[['knock', [t + 0.05, t + 0.3], 1190, 520], ['ptxt', 'нельзя', 960, 150, 120, nz, {'col': '#e2483a'}]], mv={'r': 0.05, 'shake': [[0.05, 7], [0.3, 7]]}, sfx=[[t + 0.05, 'hit', -18], [t + 0.3, 'hit', -18]])
    t = 526.4   # «Под этим законом живут и мужчины»
    V(t, bg='street', bo={'passers': True}, figs=[[1000, 1010, 0.85, 'husband', {'walk': {'x0': 2200, 'x1': 1000, 'at': t, 'dur': 1.4}, 'expr': 'neutral', 'look': -0.3}]], mv={'r': 0.035, 'px': -40})
    t = 528.8   # «бороду не короче кулака» — сам прикладывает кулак
    ku = w('кулака', t)
    V(t, bg='street', bo={'passers': False}, figs=[[960, 1080, 1.1, 'husband', {'poses': [[0, 'idle'], [w('бороду', t), 'chin'], [ku - 0.1, 'fist']], 'expr': 'focus', 'lookY': 0.5}]], view=[960, 520, 1.55],
      fx=[['ptxt', 'не короче кулака', 960, 170, 110, ku, {'col': '#ffffff'}]], mv={'r': 0.05, 'kick': 1})
    t = 532.0   # «В конце 2024 года вышел указ про окна»
    V(t, 'drop', bg='lawDesk', fx=[['ptag', 'конец 2024 года', 960, 230, w('года', t), {'size': 80, 'bg': '#ffd43b'}], ['ptxt', 'указ', 960, 520, 220, w('указ', t), {'col': '#2b6a4a'}], ['ptxt', 'про окна', 960, 760, 140, w('окна', t), {'col': '#2a2321'}]],
      mv={'r': 0.045}, sfx=[[t, 'whoosh', -14, 0.4], [w('указ', t), 'pop', -14]])
    t = 535.45  # окна не должны выходить на дворы и кухни
    l1, l2, zh = w('дворы', t), w('кухни', t), w('женщины', t)
    V(t, bg='windowView', bo={'l1': kv([0, 0], [l1, 1], d=0.4), 'l2': kv([0, 0], [l2, 1], d=0.4)},
      figs=[[900, 800, 0.4, 'aunt', {'appear': zh - 0.4, 'popIn': True, 'expr': 'smile'}], [1020, 800, 0.4, 'neighbor', {'appear': zh - 0.25, 'popIn': True, 'expr': 'smile'}], [1620, 690, 0.32, 'mother', {'appear': zh - 0.1, 'popIn': True, 'expr': 'smile'}]],
      fx=[['ptag', 'двор', 930, 540, l1, {'size': 64}], ['ptag', 'кухня', 1630, 450, l2, {'size': 64}], ['stamp', zh + 0.45, 380, 360, 110]], mv={'r': 0.03, 'px': 25}, sfx=[[zh + 0.45, 'hit', -12]])
    t = 539.65  # «велено такие окна заложить» — окно закладывается кирпичом, пыль
    k0 = w('велено', t)
    V(t, bg='bricked', bo={'k0': k0 - t}, fx=[['burst', [k0 + 0.6, k0 + 1.4, k0 + 2.2], 960, 700, 'dust', {'n': 12, 'speed': 260, 'grav': 120, 'spread': 3}]], mv={'r': 0.05, 'kick': 1}, sfx=[[k0 + 0.6, 'hit', -22], [k0 + 1.4, 'hit', -22], [k0 + 2.2, 'hit', -22]])
    t = 543.35  # «больше половины афганских женщин»
    po = w('половины', t)
    V(t, 'whip2', bg='map', bo={'view': [58.5, 28.6, 76.5, 39.4], 'hl': {'AFG': '#e9c98a'}}, under=[['dim', [[0, 0.35]]]],
      fx=[['iconrow', 10, 285, 760, 150, 1.25, {'hi': [0, 1, 2, 3, 4, 5], 'at': po, 'step': 0.08, 'col': '#c84a6a', 'off': '#e8e0d0'}], ['ptxt', 'больше половины', 960, 300, 140, po, {'col': '#ffd43b'}], ['ptag', 'данные ООН', 960, 140, w('данным', t), {'size': 70, 'bg': '#bfe0f6'}]],
      mv={'r': 0.04}, sfx=[[t, 'swish', -10], [po, 'pop', -14]])
    t = 546.0   # «теперь выходят из дома…» — дверь закрыта, она ждёт
    V(t, bg='door', bo={'open': kv([0, 0], [547.5, 0.6], d=0.4)}, figs=[[460, 990, 0.85, HER, {'seated': True, 'expr': 'tired', 'look': 1, 'lookKeys': [[0, 1]]}]], mv={'r': -0.04, 'px': 20})
    t = 548.2   # «не чаще двух раз в месяц» — дни листаются, 2 обведены
    V(t, bg='calFlip', bo={'n': kv([0, 0], [t, 30], d=1.2), 'circ': [[6, w('двух', t) - t], [20, w('раз', t) - t]]}, view=[960, 600, 0.86], fx=[['ptxt', '2 раза в месяц', 960, 960, 100, w('месяц', t), {'col': '#ffd43b'}]],
      mv={'r': 0.03, 'kick': 1}, sfx=[[w('двух', t), 'pop', -14], [w('раз', t), 'pop', -14]])

# ==================================================================== ВЕСЬ ФИЛЬМ (кроме главы 25/40 лет выше)
def F(x, y, s, who, **o): return [x, y, s, who, o]
def TG(s, at, x=960, y=150, size=74, bg=None): return ['ptag', s, x, y, at, {'size': size, **({'bg': bg} if bg else {})}]
def TX(s, at, x=960, y=160, size=110, col='#ffffff'): return ['ptxt', s, x, y, size, at, {'col': col}]
def CN(at, a, b, x=960, y=180, **o): return ['count', at, a, b, x, y, o]
YEL, BLUE = '#ffd43b', '#bfe0f6'

def build_full(add, w, END):
    V = lambda at, tr=None, **p: add(at, 'v2', tr, **p)
    RANGES.extend([(0.0, 434.09), (550.16, END + 1)])
    def card(t, a, b, title):
        V(t, 'whip2', bg='black', fx=[CN(t + 0.15, a, b, 960, 360, size=150, suf=' лет', dur=0.8), ['card', title, t + 0.6, 960, 600, 120]] if a != b else [['card', title, t + 0.3, 960, 540, 130]], mv={'r': 0.03}, vig=0, sfx=[[t + 0.15, 'counter', -14]] if a != b else [])
    FAM = [F(560, 880, 0.9, 'granny', seated=True, expr='smile'), F(960, 880, 0.9, 'mother', seated=True, pose='tea', holdR='baby', expr='smile'), F(1360, 880, 0.9, 'father', seated=True, expr='smile')]
    GIRLS = [F(560, 900, 0.62, 'girl', expr='smile', seed=31), F(820, 900, 0.62, 'girl', expr='focus', seed=32, skin='#d8a070'), F(1080, 900, 0.62, 'girl', expr='smile', seed=33), F(1340, 900, 0.62, 'girl', expr='focus', seed=34, skin='#c88c5c')]
    def digits(t, a, b, x7):  # 1…6 загораются, 7 перечёркнут
        return [TX(str(k + 1), a + (b - a) * k / 6, 300 + k * 200, 560, 190, '#ffffff') for k in range(6)] + [TX('7', x7, 1700, 560, 190, '#ff8a7a'), ['stamp', x7 + 0.15, 1700, 560, 120]]
    # ---------------------------------------------------------------- ХОЛОДНЫЙ СТАРТ
    V(0.0, bg='classroom', bo={'board': [{'t': '7 × 8 = 56', 'at': 0.0, 'cps': 14}]}, figs=[F(1100, 940, 0.78, 'girl', poses=[[0, 'point']], expr='smile', look=-1)], under=[['deskrow', [300, 1600]]], fx=[CN(0.2, 0, 12, 230, 150, size=90, suf=' лет', dur=0.8, col=YEL)], mv={'r': 0.05, 'kick': 1})
    t = 1.2
    V(t, bg='classroom', bo={'board': [{'t': '144 : 12 = 12', 'at': 0.1, 'cps': 14}]}, figs=[F(1050, 960, 1.0, 'girl', poses=[[0, 'point']], expr='focus', look=-1)], view=[760, 420, 1.6], fx=[TX('5+', w('математике', t), 1500, 300, 200, YEL), ['burst', w('лучшая', t), 760, 330, 'stars', {'n': 14}]], mv={'r': 0.05, 'px': 30})
    t = 3.0; vr = w('врач', t)
    V(t, bg='classroom', figs=[F(1250, 950, 0.9, 'teacher', expr='smile', look=-1, poses=[[0, 'idle'], [w('говорит', t), 'point']], nods=[vr]), F(700, 960, 0.78, 'girl', exprs=[[0, 'smile'], [vr, 'laugh']], look=1)], under=[['deskrow', [400]]],
      panels=[{'at': vr - 0.1, 'x': 1180, 'y': 60, 'w': 640, 'h': 400, 'bg': 'midwife', 'figs': [F(960, 980, 1.0, 'girl', coat='#f4f4ee', shirt='#f4f4ee', holdR='steth', pose='hold', expr='laugh')], 'fy': 600}], fx=[TG('врач?', vr, 1500, 520, 70, YEL)], mv={'r': 0.04}, sfx=[[vr, 'shimmer', -18]])
    t = 5.65; pd = w('последний', t)
    V(t, 'whip2', bg='gate', bo={'dusk': 1, 'close': 0.0}, figs=[F(960, 1000, 0.7, 'girl', walk={'x0': 300, 'x1': 960, 'at': t, 'dur': 1.8}, pack='#3a6aa8', expr='sad')], fx=[TG('последний день', pd, size=80, bg=YEL)], mv={'r': 0.04, 'py': -10})
    t = 8.4
    V(t, bg='paper', fx=[['plate', t + 0.05, 960, 230, 'тетрадь', '#f6f1e4'], TX('5', w('потому', t), 600, 560, 260, '#2b8a4a'), TX('5', w('плохо', t), 960, 560, 260, '#2b8a4a'), TX('5', w('учишься', t), 1320, 560, 260, '#2b8a4a')], mv={'r': 0.05, 'kick': 1}, sfx=[[w('плохо', t), 'pop', -16]])
    t = 10.62; dv = w('девочка', t)
    V(t, 'impact', bg='classroom', figs=[F(960, 960, 0.95, 'girl', exprs=[[0, 'neutral'], [dv, 'sad']], tearAt=dv + 0.3, look=0, lookY=0.3)], view=[960, 560, 2.2], fx=[TX('ты девочка', dv, 960, 930, 150)], tint='cold', mv={'r': 0.05, 'shake': [[0.0, 10]]})
    t = 12.3; pt = w('путает', t)
    V(t, bg='classroom', bo={'board': [{'t': 'А Б Я В', 'at': 0.2, 'cps': 6}]}, figs=[F(1150, 960, 0.75, 'brother', expr='smile', poses=[[0, 'point'], [pt, 'shrug']], look=-1)], under=[['deskrow', [600]]], fx=[TX('?', pt, 900, 420, 200, YEL)], mv={'r': 0.04, 'kick': 1})
    t = 14.9; bu = w('будет', t); da = w('дальше', t)
    V(t, bg='color', bo={'col': '#1e1a26'}, panels=[{'at': bu - 0.1, 'x': 60, 'y': 150, 'w': 880, 'h': 700, 'bg': 'classroom', 'figs': [F(960, 960, 0.9, 'brother', expr='laugh', poses=[[0, 'cheer']])], 'fy': 620},
        {'at': da - 0.1, 'x': 980, 'y': 150, 'w': 880, 'h': 700, 'bg': 'gate', 'bo': {'close': 1, 'dusk': 1}, 'figs': [F(960, 1000, 0.9, 'girl', expr='sad', tear=1)], 'fy': 620}], fx=[['ok', bu + 0.2, 500, 220], ['stamp', da + 0.3, 1420, 220, 90]], mv={'r': 0.03})
    t = 16.9; od = w('одна', t)
    V(t, 'whip2', bg='globe', bo={'lon': 66, 'lat': 30, 'hl': {'AFG': '#e2483a'}, 'spin': 3}, fx=[TG('1 страна в мире', od, size=84, bg=YEL)], mv={'r': 0.06, 'kick': 1})
    t = 19.7
    V(t, bg='color', bo={'col': '#2a2638'}, fx=[TX('классы', t + 0.1, 960, 260, 100)] + digits(t, w('девочкам', t), w('учиться', t), w('шестого', t)), mv={'r': 0.04}, sfx=[[w('шестого', t) + 0.15, 'hit', -12]])
    t = 23.4
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(1150, 900, 0.6, 'girl', walk={'x0': 2100, 'x1': 1150, 'at': t, 'dur': 1.4}, expr='smile', lookY=-0.8)], mv={'r': 0.03, 'px': -40})
    t = 25.75; sk = w('школу', t)
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(1300, 920, 0.7, 'girl', expr='sad', look=-1), F(600, 900, 0.6, 'brother', walk={'x0': 700, 'x1': -300, 'at': t + 0.3, 'dur': 3.0, 'lin': 1}, pack='#c8453a', expr='smile')], fx=[TX('?', sk, 1500, 300, 240, YEL)], mv={'r': 0.04})
    t = 29.74
    V(t, 'dip', bg='courtyard', bo={'night': 1}, fx=[['dim', [[0, 0.45]]], TX('ЧТО ЕСЛИ БЫ ТЫ РОДИЛАСЬ', t + 0.3, 960, 400, 120), TX('ДЕВОЧКОЙ В АФГАНИСТАНЕ?', t + 0.8, 960, 560, 120, YEL)], mv={'r': 0.03}, sfx=[[t + 0.3, 'stinger', -16]])
    # ---------------------------------------------------------------- 0 ЛЕТ
    t = 32.35
    V(t, 'whip2', bg='globe', bo={'lon': 66, 'lat': 32, 'hl': {'AFG': '#e2a23a'}}, fx=[TG('0 лет', t + 0.2, 230, 150, 80, YEL), TX('Кабул', w('Афганистане', t), 1120, 420, 110, YEL)], mv={'r': 0.07, 'kick': 1})
    t = 34.55
    V(t, bg='courtyard', view=[1000, 520, 1.15], fx=[TG('глиняный дом', w('Глиняный', t), 960, 180)], mv={'r': 0.05, 'kick': 1})
    t = w('абрикосовый', t) - 0.1
    V(t, bg='courtyard', bo={'blossom': 1}, view=[420, 420, 1.8], fx=[TG('абрикосовый сад', t + 0.1, 960, 180), ['burst', [t + 0.2, t + 0.9], 960, 300, 'sparkle', {'n': 16, 'grav': 80}]], mv={'r': 0.05, 'px': 25})
    t = w('горы', t) - 0.2
    V(t, bg='courtyard', view=[1100, 300, 1.7], fx=[TG('горы в снегу', w('снегу', t), 960, 180)], mv={'r': 0.03, 'py': -25})
    t = 39.85
    V(t, bg='room', figs=FAM, fx=[TG('имя?', w('Имя', t), 960, 170, 84, YEL)], mv={'r': 0.04, 'kick': 1})
    t = 41.7
    sw = [t + 0.1 + 0.45 * k for k in range(5)]
    V(t, bg='room', figs=[F(560, 880, 0.9, 'granny', seated=True, expr='smile', look=1), F(960, 880, 0.9, 'mother', seated=True, holdR='baby', expr='worried', look=-1, poses=[[sw[0], 'tea'], [sw[1], 'shrug'], [sw[3], 'tea']], talkKeys=[[0, 1], [sw[2], 0]]), F(1360, 880, 0.9, 'father', seated=True, expr='angry', look=-1, poses=[[sw[0], 'idle'], [sw[2], 'point'], [sw[4], 'shrug']], talkKeys=[[0, 0], [sw[2], 1]])],
      fx=[TG('Фатима?', sw[0], 960, 320, 64), TG('Зарина?', sw[2], 1360, 320, 64)], view=[1100, 560, 1.3], mv={'r': 0.04})
    t = w('побеждает', 43) - 0.6
    V(t, bg='room', figs=[F(960, 900, 1.05, 'granny', seated=True, poses=[[0, 'point'], [t + 0.6, 'cheer']], exprs=[[0, 'focus'], [t + 0.6, 'laugh']])], view=[960, 520, 1.6], fx=[['burst', t + 0.65, 960, 300, 'stars', {'n': 20}]], mv={'r': 0.05, 'kick': 1}, sfx=[[t + 0.65, 'ding', -18]])
    t = 45.35
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 880, 0.95, 'mother', seated=True, pose='tea', holdR='baby', expr='tired', look=-0.4, nods=[46.5])], fx=[['glow', 960, 300, 400]], mv={'r': -0.035})
    t = 47.45; tr = w('третий', t)
    V(t, bg='paper', fx=[['iconrow', 3, 560, 640, 400, 2.2, {'hi': [0], 'at': tr, 'col': '#e2483a'}], TX('≈ 1 из 3', tr, 960, 230, 160, YEL), TG('рождаются дома', tr + 0.4, 960, 930, 70)], mv={'r': 0.045, 'kick': 1})
    t = w('часто', 50) - 0.1
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 880, 0.9, 'mother', seated=True, pose='tea', holdR='baby', expr='worried')], fx=[TG('врач', w('врача', t), 520, 300, 80), ['stamp', w('врача', t) + 0.2, 520, 300, 90], TG('акушерка', w('акушерки', t), 1400, 300, 80), ['stamp', w('акушерки', t) + 0.3, 1400, 300, 90]], mv={'r': 0.04}, sfx=[[w('врача', t) + 0.2, 'hit', -16], [w('акушерки', t) + 0.3, 'hit', -16]])
    t = 53.5
    V(t, 'impact', bg='clockNight', tint='red', mv={'r': 0.06})
    t = 55.25
    V(t, bg='clockNight', fx=[TG('данные ВОЗ', w('Всемирной', t), 960, 160, 76, BLUE)], mv={'r': 0.04, 'px': 30})
    t = w('каждый', 57) - 0.1
    V(t, bg='color', bo={'col': '#1a1622'}, fx=[['clockspin', 960, 500, 230, t + 0.1, 1.2], TX('1 мама в час', w('умирает', t), 960, 900, 130)], tint='red', mv={'r': 0.05, 'kick': 1}, sfx=[[t + 0.1, 'clock', -18, 2.0]])
    t = 60.9
    V(t, bg='room', figs=[F(800, 900, 1.0, 'mother', seated=True, pose='tea', holdR='baby', exprs=[[0, 'tired'], [t + 0.4, 'laugh']]), F(1260, 900, 0.95, 'father', walk={'x0': 2100, 'x1': 1260, 'at': t + 0.2, 'dur': 0.9}, expr='smile', look=-1)], fx=[['burst', t + 0.6, 800, 350, 'hearts', {'n': 14}]], tint='pink', mv={'r': 0.04, 'kick': 1})
    t = 62.7
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(500, 930, 0.6, 'kid', walk={'x0': -200, 'x1': 1500, 'at': t, 'dur': 2.6, 'lin': 1}, expr='laugh'), F(900, 920, 0.62, 'brother', expr='laugh', jumpAt=[t + 0.4, t + 1.4], poses=[[0, 'cheer']]), F(1350, 930, 0.6, 'kid', walk={'x0': 2100, 'x1': 300, 'at': t + 0.3, 'dur': 2.8, 'lin': 1}, expr='smile', seed=14, coat='#7a9a5a')], fx=[['burst', [t + 0.5, t + 1.5], 900, 500, 'stars', {'n': 10}]], mv={'r': 0.03, 'px': 40})
    t = 65.95; p5 = w('пятеро', t)
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(500 + k * 230, 930, 0.55, 'kid' if k % 2 else 'girl', appear=p5 - 0.6 + k * 0.15, popIn=True, expr='laugh', seed=40 + k, coat=['#c8a24a', '#7a9a5a', '#3a6aa8', '#c8453a', '#8a5a9a'][k]) for k in range(5)], fx=[CN(p5 - 0.6, 0, 5, 960, 200, size=170, suf=' детей', dur=0.75, pre='≈ ')], mv={'r': 0.04}, sfx=[[p5 - 0.6 + k * 0.15, 'pop', -18] for k in range(5)])
    t = 69.0
    V(t, bg='room', figs=[F(960, 920, 1.0, 'aunt', walk={'x0': 2100, 'x1': 960, 'at': t, 'dur': 1.0}, exprs=[[0, 'smile'], [w('весёлая', t), 'laugh']], holdR='notes', pose='tea', jumpAt=w('весёлая', t))], fx=[TG('тётя', w('тётя', t), 960, 170, 84, YEL)], mv={'r': 0.04, 'kick': 1})
    t = 72.8; zn = w('знает', t)
    V(t, bg='room', figs=[F(960, 920, 1.0, 'aunt', poses=[[0, 'point'], [zn, 'shrug']], expr='laugh', look=0.6)], view=[960, 520, 1.3], fx=[CN(t + 0.1, 0, 20, 300, 200, size=120, suf=' лет', dur=0.7), TG('книги', zn, 520, 480, 72), TG('радио', w('всё', t), 1420, 420, 72), TG('карты', w('свете', t), 1400, 700, 72)], mv={'r': 0.05})
    t = 76.0
    V(t, 'whip2', bg='courtyard', bo={'blossom': 1}, fx=[TG('Навруз', w('Навруз', t), 960, 170, 90, YEL), ['burst', [t + 0.3, t + 1.3, t + 2.3], 960, 200, 'sparkle', {'n': 18, 'grav': 120}]], mv={'r': 0.04, 'py': -20})
    t = w('вся', 78) - 0.1
    V(t, bg='room', figs=[F(560, 880, 0.9, 'granny', seated=True, expr='smile', appear=t + 0.1, popIn=True), F(960, 880, 0.9, 'mother', seated=True, pose='tea', holdR='baby', expr='smile', appear=t + 0.4, popIn=True), F(1360, 880, 0.9, 'father', seated=True, expr='smile', appear=t + 0.7, popIn=True)], over=[['dast']], fx=[TG('дастархан', w('дастархана', t), 960, 170, 80)], mv={'r': 0.04})
    t = 82.25
    V(t, 'whip2', bg='foodInsert', bo={'dish': 'palau'}, fx=[TG('кабули палау', w('кабули', t), 960, 150, 84, YEL), TG('рис', w('рис', t), 420, 360, 70), TG('морковь', w('морковью', t), 1500, 360, 70), TG('изюм', w('изюмом', t), 420, 820, 70), TG('мясо', w('мясом', t), 1500, 820, 70)], mv={'r': 0.045}, sfx=[[w(x, t), 'pop', -18] for x in ('рис', 'морковью', 'изюмом', 'мясом')])
    t = 86.2
    V(t, 'whip2', bg='foodInsert', bo={'dish': 'bolani'}, fx=[TG('болани', w('болани', t), 960, 150, 84, YEL), TG('картошка', w('картошкой', t), 420, 820, 70), TG('зелень', w('зеленью', t), 1500, 820, 70), ['burst', [t + 0.3, t + 1.1, t + 1.9], 960, 560, 'steam', {'n': 10, 'grav': -120, 'speed': 120}]], mv={'r': 0.05})
    t = 89.55
    V(t, bg='courtyard', bo={'night': 1}, fx=[TG('Навруз', t + 0.1, 960, 300, 100, YEL), ['stamp', w('не', t), 960, 300, 130], TG('официально: нет', w('отмечают', t), 960, 700, 70)], mv={'r': 0.04, 'kick': 1})
    t = 92.35
    V(t, bg='room', bo={'night': 1}, figs=[F(560, 880, 0.9, 'granny', seated=True, expr='laugh'), F(960, 880, 0.9, 'mother', seated=True, pose='tea', holdR='baby', expr='laugh'), F(1360, 880, 0.9, 'father', seated=True, expr='laugh', nods=[93.2])], over=[['dast'], ['glow', 960, 240, 500]], mv={'r': 0.04})
    t = 94.6
    V(t, bg='room', figs=[F(820, 900, 1.0, 'mother', seated=True, pose='tea', holdR='baby', expr='calm', tilt=0.1), F(1180, 900, 1.0, 'father', seated=True, expr='smile', look=-0.6, poses=[[0, 'idle'], [t + 0.3, 'reach']])], fx=[['burst', t + 0.3, 900, 400, 'hearts', {'n': 16}]], view=[1000, 540, 1.3], tint='pink', mv={'r': 0.05})
    t = 96.2; tz = w('трудно', t)
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 880, 0.95, 'mother', seated=True, pose='tea', holdR='baby', exprs=[[0, 'smile'], [tz, 'worried']])], over=[['dim', [[0, 0], [tz, 0.55]]]], mv={'r': -0.035}, sfx=[[tz, 'riser', -22, 1.2]])
    t = 99.45
    V(t, bg='room', bo={'night': 1}, figs=[F(760, 900, 0.95, 'mother', seated=True, holdR='baby', pose='tea', expr='sad', appear=w('мама', t), popIn=True), F(1160, 900, 0.95, 'father', seated=True, expr='sad', appear=w('папа', t), popIn=True)], fx=[TG('не виноваты', w('виноваты', t), 960, 170, 76)], mv={'r': 0.04})
    card(101.85, 0, 7, 'Первый класс')
    # ---------------------------------------------------------------- 7 ЛЕТ
    t = 104.5
    V(t, bg='street', figs=[F(960, 1010, 0.7, 'girl', walk={'x0': -200, 'x1': 1100, 'at': t, 'dur': 2.0}, pack='#3a6aa8', expr='laugh')], fx=[TG('7 лет', t + 0.2, 230, 150, 80, YEL)], mv={'r': 0.03, 'px': 40})
    t = 106.9
    V(t, bg='gate', figs=[F(860, 1000, 0.6, 'girl', walk={'x0': 300, 'x1': 860, 'at': t, 'dur': 1.2}, pack='#3a6aa8', expr='smile'), F(1100, 1000, 0.6, 'girl', walk={'x0': 1700, 'x1': 1100, 'at': t, 'dur': 1.2}, expr='smile', seed=35)], fx=[TX('пока можно', w('можно', t), 960, 170, 120, YEL)], mv={'r': 0.04, 'kick': 1})
    t = 108.25
    V(t, bg='gate', view=[960, 600, 1.3], figs=[F(960, 1000, 0.6, 'girl', expr='laugh', jumpAt=w('открыта', t))], fx=[TG('1-6 класс: можно', w('открыта', t) - 0.3, 960, 170, 80, YEL), ['ok', w('открыта', t), 1500, 300]], mv={'r': 0.04})
    t = 110.65
    V(t, bg='classroom', figs=[F(960, 960, 1.0, 'girl', expr='smile')], view=[960, 620, 1.6], fx=[TG('чёрное платье', w('Чёрное', t), 520, 800, 72), TG('белый платок', w('белый', t), 1400, 300, 72)], mv={'r': 0.05, 'kick': 1})
    t = 113.15
    V(t, bg='street', figs=[F(300 + k * 300, 1010, 0.6, 'girl', walk={'x0': -500 + k * 300, 'x1': 500 + k * 300, 'at': t, 'dur': 2.8, 'lin': 1}, pack='#3a6aa8', expr='smile', seed=31 + k) for k in range(4)], mv={'r': 0.02, 'px': 40})
    t = 116.15
    V(t, bg='classroom', bo={'board': [{'t': 'А  Б  В  Г', 'at': 0.1, 'cps': 9}]}, figs=[F(1100, 940, 0.75, 'girl', pose='point', expr='focus', look=-1)], view=[820, 470, 1.3], mv={'r': 0.06, 'kick': 1})
    t = w('считаешь', t) - 0.1
    V(t, bg='classroom', figs=[F(960, 1000, 1.05, 'girl', pose='hold2', expr='focus', lookY=0.5)], view=[960, 620, 1.7], fx=[TX('1', t + 0.15, 420, 300, 160, YEL), TX('2', t + 0.45, 1500, 260, 160, YEL), TX('3', t + 0.75, 1600, 520, 160, YEL)], mv={'r': 0.06}, sfx=[[t + 0.15 + 0.3 * k, 'blip', -18] for k in range(3)])
    t = w('рисуешь', t) - 0.1
    V(t, bg='paper', fx=[['plate', t, 960, 200, 'горы', '#f6f1e4'], ['sketch', t + 0.1, 1.0, 360, 760, 1200]], mv={'r': 0.05, 'kick': 1})
    t = 119.75
    V(t, bg='room', figs=[F(760, 900, 0.75, 'girl', seated=True, pose='hold', holdR='book', expr='smile', look=1, talk=True), F(1120, 900, 0.65, 'brother', seated=True, expr='tired', look=-1)], mv={'r': 0.04, 'px': 30})
    t = 122.3
    V(t, bg='room', figs=[F(960, 900, 0.95, 'brother', seated=True, exprs=[[0, 'tired']], mouthKeys=[[0, 0], [t + 0.3, 1], [t + 1.0, 0]], eyesShut=False, shakes=[t + 1.0], sweatAt=t + 0.4)], view=[960, 540, 1.6], mv={'r': 0.06, 'kick': 1})
    t = 123.9
    V(t, 'whip2', bg='room', bo={'night': 1}, figs=[F(800, 900, 1.0, 'granny', seated=True, expr='calm', mouthKeys=[[0, 1]], look=0.6), F(1180, 900, 0.65, 'girl', seated=True, expr='smile', look=-1)], fx=[['burst', [t + 0.3, t + 1.0, t + 1.7, t + 2.4], 900, 420, 'notes', {'n': 3, 'speed': 220, 'grav': -60, 'dir': -1.0, 'spread': 0.9, 'size': 22, 'life': 1.4}], TG('ландаи', w('ландаи', t), 960, 160, 80, YEL)], mv={'r': 0.04})
    t = 126.85
    V(t, bg='paper', fx=[['plate', t + 0.1, 960, 200, 'ландай', YEL], TX('строка 1', w('всего', t), 960, 460, 120, '#3a5a8a'), TX('строка 2', w('строк', t), 960, 660, 120, '#3a5a8a'), CN(w('двух', t), 0, 2, 960, 880, size=110, suf=' строки', dur=0.5, col='#e2483a')], mv={'r': 0.05, 'kick': 1})
    t = 129.8
    V(t, bg='courtyard', bo={'night': 1}, fx=[TG('о любви', w('любви', t), 420, 400, 84), ['burst', w('любви', t) + 0.1, 420, 400, 'hearts', {'n': 12}], TG('о разлуке', w('разлуке', t), 960, 600, 84), TG('о доме', w('доме', t), 1500, 400, 84)], mv={'r': 0.04}, sfx=[[w(x, t), 'pop', -18] for x in ('любви', 'разлуке', 'доме')])
    t = 132.4
    V(t, bg='courtyard', bo={'night': 1}, figs=[F(600 + k * 360, 920, 0.7, ['granny', 'mother', 'neighbor'][k], expr='calm', mouthKeys=[[0, 1]], seed=60 + k) for k in range(3)], fx=[['burst', [t + 0.5, t + 1.6, t + 2.7], 960, 420, 'notes', {'n': 4, 'speed': 260, 'grav': -40, 'size': 22, 'life': 1.4}], TG('автор: ?', w('нет', t), 960, 170, 84, YEL)], mv={'r': 0.03, 'px': 30})
    t = 136.8
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 900, 1.0, 'girl', seated=True, expr='focus', nods=[t + 0.3, w('пригодятся', t)], exprs=[[0, 'focus'], [w('пригодятся', t), 'smile']])], view=[960, 540, 1.7], mv={'r': 0.05, 'kick': 1})
    t = 139.6
    V(t, 'whip2', bg='courtyard', bo={'kites': 1}, figs=[F(900, 900, 0.65, 'brother', poses=[[0, 'up']], holdR='spool', expr='laugh', lookY=-1), F(1180, 900, 0.6, 'girl', expr='smile', lookY=-1)], mv={'r': 0.03, 'py': -30})
    t = w('даёт', 141) - 0.15
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(760, 940, 1.0, 'brother', poses=[[0, 'hold']], holdKeys=[[0, 'spool'], [w('подержать', t), None]], expr='smile', look=1), F(1180, 940, 0.95, 'girl', poses=[[0, 'idle'], [w('подержать', t), 'hold']], holdKeys=[[0, None], [w('подержать', t), 'spool']], exprs=[[0, 'smile'], [w('катушку', t), 'laugh']], look=-1)], view=[960, 520, 1.5], fx=[['burst', w('катушку', t), 1300, 500, 'stars', {'n': 12}]], mv={'r': 0.05})
    t = 144.5
    V(t, bg='courtyard', bo={'kites': 1}, view=[960, 260, 1.7], fx=[['burst', [t + 0.4, t + 1.6], 960, 300, 'sparkle', {'n': 14, 'grav': 40}]], mv={'r': 0.03, 'py': -40}, tint='pink')
    t = 147.95
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(640, 920, 0.65, 'girl', expr='smile', poses=[[0, 'idle'], [w('подпишись', t), 'point']], look=1)], fx=[['sub', 0.5]], mv={'r': 0.03})
    t = 153.05
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(640, 920, 0.65, 'girl', expr='laugh', poses=[[0, 'cheer']], jumpAt=w('много', t))], fx=[['sub', -2.0], ['burst', w('много', t), 1300, 600, 'hearts', {'n': 16}]], mv={'r': 0.04, 'kick': 1})
    card(156.77, 7, 12, 'Последний звонок')
    # ---------------------------------------------------------------- 12 ЛЕТ
    t = 159.45
    V(t, bg='classroom', bo={'board': [{'t': '6 класс', 'at': 0.2, 'cps': 10}]}, figs=GIRLS, under=[['deskrow', [300, 1620]]], fx=[CN(w('шестой', t), 1, 6, 1420, 220, size=130, suf=' класс', dur=0.6)], mv={'r': 0.04, 'kick': 1})
    t = 161.55
    V(t, 'impact', bg='classroom', figs=[F(960, 960, 0.95, 'girl', expr='sad', lookY=0.3)], view=[960, 560, 2.1], fx=[TX('последний', w('последний', t), 960, 920, 140)], mv={'r': 0.05})
    t = 163.0
    V(t, bg='classroom', figs=[F(960, 960, 0.8, 'girl', pose='desk', expr='sad', lookY=0.6)] + [F(1300 + k * 200, 960, 0.6, 'girl', walk={'x0': 1300 + k * 200 - 600, 'x1': 2300, 'at': t + 0.3 + k * 0.5, 'dur': 1.6, 'lin': 1}, pack='#3a6aa8', expr='smile', seed=36 + k) for k in range(2)], under=[['deskrow', [960]]], mv={'r': 0.03, 'px': 30})
    t = 166.4
    V(t, bg='classroom', figs=[F(960, 1000, 1.0, 'girl', pose='desk', expr='sad', lookY=0.7)], view=[960, 700, 1.7], fx=[['stack', [t + 0.3, t + 0.8, t + 1.3, t + 1.8], 960, 880]], mv={'r': 0.05, 'kick': 1})
    t = 169.3
    V(t, bg='classroom', figs=[F(1450, 950, 0.9, 'teacher', expr='sad', look=-1, pose='hold', holdR='key', nods=[171.0]), F(600, 960, 0.6, 'girl', pose='desk', expr='sad', lookY=0.6)], under=[['deskrow', [600]]], mv={'r': 0.04, 'px': 25})
    t = 172.4
    V(t, 'dipWhite', bg='gate', figs=[F(960, 1000, 0.75, 'aunt', walk={'x0': 400, 'x1': 960, 'at': t, 'dur': 1.6}, expr='smile', pack='#3a6aa8')], fx=[TG('тётя', w('тётя', t), 230, 150, 80, YEL)], tint='sepia', mv={'r': 0.04})
    t = 175.2
    V(t, bg='gate', figs=[F(960, 1000, 0.8, 'aunt', expr='smile', look=0, pack='#3a6aa8')], view=[960, 620, 1.3], fx=[TG('осень 2021', w('Осенью', t), 960, 170, 84, YEL), CN(w('пятнадцать', t), 0, 15, 1500, 400, size=150, suf=' лет', dur=0.6)], tint='sepia', mv={'r': 0.05, 'kick': 1})
    t = w('просто', 177) - 0.2
    V(t, bg='gate', bo={'close': {'kv': [[0, 0], [w('пустили', t), 1]], 'd': 0.4}}, figs=[F(960, 1000, 0.8, 'aunt', exprs=[[0, 'worried'], [w('обратно', t), 'sad']], tearAt=w('обратно', t), pack='#3a6aa8', walk={'x0': 960, 'x1': 900, 'at': w('обратно', t), 'dur': 0.6})], tint='sepia', mv={'r': 0.04, 'shake': [[w('пустили', t) - t + 0.4, 8]]}, sfx=[[w('пустили', t) + 0.4, 'hit', -12]])
    t = 181.2
    V(t, bg='color', bo={'col': '#2a2638'}, fx=[TX('с тех пор', t + 0.05, 960, 260, 100)] + digits(t, w('девочкам', t), w('учиться', t), w('шестого', t)), mv={'r': 0.04})
    t = 185.05
    V(t, bg='classroom', figs=[F(960, 960, 0.85, 'brother', walk={'x0': -200, 'x1': 960, 'at': t, 'dur': 1.2}, expr='laugh', pack='#c8453a')], fx=[TG('7 класс', w('седьмой', t), 960, 170, 84, YEL)], mv={'r': 0.04, 'px': 30})
    t = 187.15
    V(t, 'impact', bg='gate', bo={'close': 1, 'dusk': 1}, figs=[F(960, 1000, 0.9, 'girl', expr='sad', tear=1, lookY=0.4)], view=[960, 560, 1.7], mv={'r': 0.05})
    t = 189.45; mm = w('двух', t)
    V(t, bg='icons', bo={'n': 50, 'rows': 5, 'frac': 1.0, 'col': '#e2483a', 'at': mm - 0.2}, fx=[CN(mm, 0, 2.5, 960, 140, size=150, pre='> ', suf=' млн', dec=1, dur=1.2, unit='девочек без школы', uy=690, usize=80)], mv={'r': 0.035, 'kick': 1}, sfx=[[mm, 'counter', -15]])
    t = 193.9
    V(t, 'whip2', bg='gate', bo={'close': 1}, fx=[TG('запрет', t + 0.2, 960, 300, 100, '#f6efdc'), TG('временно', w('временным', t), 960, 500, 100, YEL)], mv={'r': 0.04})
    t = w('обещают', 196) - 0.1
    V(t, bg='gate', bo={'close': 1}, fx=[TG('обещают открыть', t + 0.1, 960, 170, 84), ['clockspin', 1600, 420, 140, t + 0.4, 1.5]], mv={'r': 0.03, 'px': -30})
    t = 202.95; pl = w('пять', t)
    V(t, bg='years', bo={'a': 2021, 'b': 2026, 'at': t + 0.05}, fx=[CN(pl, 0, 5, 960, 900, size=160, suf=' лет', dur=0.6)], mv={'r': 0.04, 'px': 30})
    t = 205.4
    V(t, 'whip2', bg='globe', bo={'lon': 50, 'lat': 25, 'hl': {'AFG': '#e2483a', 'TUR': '#4fa04a', 'IRN': '#4fa04a', 'PAK': '#4fa04a', 'SAU': '#4fa04a', 'EGY': '#4fa04a', 'IDN': '#4fa04a', 'MYS': '#4fa04a', 'UZB': '#4fa04a', 'TJK': '#4fa04a', 'KAZ': '#4fa04a', 'BGD': '#4fa04a'}}, fx=[TG('девочки учатся', w('учатся', t), 960, 150, 80, '#bfe8b0')], mv={'r': 0.05})
    t = w('и', 208.3) - 0.05
    V(t, bg='color', bo={'col': '#1e1a26'}, panels=[{'at': w('школе', t) - 0.1, 'x': 60, 'y': 170, 'w': 880, 'h': 640, 'bg': 'classroom', 'figs': GIRLS[:3], 'fy': 640}, {'at': w('университете', t) - 0.1, 'x': 980, 'y': 170, 'w': 880, 'h': 640, 'bg': 'auditorium', 'figs': [F(960, 1000, 0.8, 'student70', expr='smile', pose='tea', holdR='notes')], 'fy': 640}],
      fx=[TG('школа', w('школе', t), 500, 920, 76), TG('университет', w('университете', t), 1420, 920, 76)], mv={'r': 0.03})
    t = 210.9
    V(t, bg='globe', bo={'lon': 50, 'lat': 25, 'hl': {'AFG': '#e2483a'}, 'spin': 3}, fx=[TG('ОИС: против', w('Против', t) + 0.1, 960, 150, 90, YEL), ['stamp', w('сотрудничества', t), 960, 560, 110]], mv={'r': 0.05, 'kick': 1})
    t = 215.0
    V(t, 'lightning', bg='color', bo={'col': '#3a2a1a'}, fx=[CN(t + 0.2, 2026, 1970, 960, 480, size=220, dur=2.4, col='#f6e2b8'), TG('так было не всегда', w('всегда', t), 960, 820, 80, YEL)], tint='sepia', mv={'r': 0.05}, sfx=[[t + 0.2, 'counter', -16, 2.0]])
    t = 218.4
    V(t, bg='auditorium', figs=[F(960, 1000, 0.85, 'student70', walk={'x0': -200, 'x1': 960, 'at': t, 'dur': 1.5}, expr='smile', holdR='notes', pose='tea')], fx=[TG('Кабул, 1970-е', w('Кабуле', t), 960, 150, 80, YEL)], tint='sepia', mv={'r': 0.04})
    t = w('ты', 221) - 0.1
    V(t, bg='auditorium', figs=[F(700, 1000, 0.75, 'student70', expr='focus', pose='write', holdR='pen'), F(1200, 1000, 0.75, 'student70', expr='smile', seed=26, hairC='#5a3a22', coat='#8a5a4a', nods=[t + 1.0])], tint='sepia', mv={'r': 0.04, 'px': -30})
    t = 224.4
    V(t, bg='color', bo={'col': '#2a2016'}, panels=[{'at': w('горожанки', t) - 0.15, 'x': 60, 'y': 170, 'w': 880, 'h': 640, 'bg': 'auditorium', 'figs': [F(960, 1000, 0.85, 'student70', expr='smile')], 'fy': 640}, {'at': w('деревнях', t) - 0.1, 'x': 980, 'y': 170, 'w': 880, 'h': 640, 'bg': 'courtyard', 'figs': [F(960, 920, 0.8, 'girl', expr='neutral', scarf='#c8a46a')], 'fy': 640}],
      fx=[TG('город', w('горожанки', t), 500, 920, 76), TG('деревня', w('деревнях', t), 1420, 920, 76)], tint='sepia', mv={'r': 0.03})
    t = 229.5; gl = w('голосовать', t)
    V(t, bg='auditorium', figs=[F(760, 1000, 0.85, 'student70', poses=[[0, 'hold'], [gl, 'reach']], holdKeys=[[0, 'notes'], [gl + 0.1, None]], expr='smile', look=1)], fx=[['ballot', gl + 0.1, 1120, 900], TG('1964', w('шестьдесят', t), 960, 150, 90, YEL), TG('голосовать', gl, 1300, 400, 72)], tint='sepia', mv={'r': 0.04, 'kick': 1})
    t = w('и', 232.5) - 0.05
    V(t, bg='auditorium', figs=[F(960, 820, 0.8, 'student70', poses=[[0, 'point']], talk=True, expr='smile', seed=27, coat='#7a3a5a')], under=[['podium', 960, 900]], fx=[TG('избираться', w('избираться', t), 960, 150, 80, YEL)], tint='sepia', mv={'r': 0.05})
    t = 235.9
    V(t, bg='auditorium', figs=[F(960, 900, 0.85, 'student70', seated=True, expr='focus', seed=28, coat='#3a4a5a', hair='bob')], under=[['tv', -1000, 0, 0.01]], fx=[['plate', w('министром', t), 960, 900, 'министр здравоохранения', '#f6f1e4'], TG('первая женщина-министр', w('первой', t), 960, 150, 70, YEL)], tint='sepia', mv={'r': 0.04})
    t = 240.85
    V(t, bg='color', bo={'col': '#1e1a26'}, panels=[{'at': t + 0.05, 'x': 60, 'y': 170, 'w': 880, 'h': 640, 'bg': 'auditorium', 'old': 1, 'figs': [F(960, 1000, 0.85, 'student70', expr='smile')], 'fy': 640}, {'at': w('семья', t) - 0.2, 'x': 980, 'y': 170, 'w': 880, 'h': 640, 'bg': 'gate', 'bo': {'close': 1}, 'figs': [F(960, 1000, 0.85, 'girl', expr='sad')], 'fy': 640}],
      fx=[TG('1970-е', t + 0.1, 500, 920, 76), TG('сегодня', w('семья', t), 1420, 920, 76, YEL), TX('совсем разные жизни', w('разные', t), 960, 110, 100)], mv={'r': 0.03})
    card(245.25, 12, 15, 'Школа, которой нет')
    # ---------------------------------------------------------------- 15 ЛЕТ
    t = 247.9
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 900, 1.0, 'girl', expr='focus', nods=[t + 0.6], poses=[[0, 'idle'], [t + 0.5, 'fist']])], view=[960, 560, 1.6], mv={'r': 0.06, 'kick': 1})
    t = 249.3
    V(t, bg='room', bo={'night': 1}, figs=[F(560 + k * 270, 900, 0.62, 'girl', expr='focus' if k % 2 else 'smile', seed=31 + k, appear=t + 0.2 + k * 0.25, popIn=True) for k in range(4)], fx=[TX('много', w('много', t), 960, 170, 120, YEL)], mv={'r': 0.04}, sfx=[[t + 0.2 + k * 0.25, 'pop', -18] for k in range(4)])
    t = 251.6
    V(t, bg='room', figs=[F(1100, 920, 0.95, 'aunt', walk={'x0': 2100, 'x1': 1100, 'at': t, 'dur': 1.0}, holdR='book', pose='hold', expr='smile', look=-1), F(600, 900, 0.75, 'girl', seated=True, expr='laugh', look=1)], fx=[TG('тётя', w('тётя', t), 1100, 200, 80, YEL)], mv={'r': 0.04, 'px': -25})
    t = 253.85
    V(t, bg='room', figs=[F(800, 920, 0.95, 'aunt', poses=[[0, 'reach'], [t + 0.8, 'hold']], holdKeys=[[0, None], [t + 0.8, 'book']], expr='focus', look=1)], under=[['bed', 1200, 900, 600]], fx=[['stack', [t + 0.5, t + 0.9, t + 1.3], 1200, 700]], view=[1000, 640, 1.3], mv={'r': 0.05, 'kick': 1})
    t = 255.8
    V(t, 'whip2', bg='afgMap', bo={'k': 0}, fx=[['dim', [[0, 0.5]]], ['dots', w('квартирах', t), 24, 760, 300, 600, 420], TG('тайные классы', w('тайные', t), 960, 150, 84, YEL)], mv={'r': 0.05})
    t = 259.7
    V(t, bg='street', bo={'dusk': 1, 'passers': False}, figs=[F(1100, 1010, 0.7, 'girl', walk={'x0': -200, 'x1': 1100, 'at': t, 'dur': 1.4}, expr='worried', turnKeys=[[0, 0], [t + 1.5, -0.6], [t + 2.3, 0.6]], seed=43), F(1300, 1010, 0.7, 'girl', walk={'x0': -200, 'x1': 700, 'at': t + 1.8, 'dur': 1.3}, expr='worried', seed=44, skin='#d8a070')], fx=[TG('по одной', w('одной', t), 960, 160, 84)], mv={'r': 0.03, 'px': 35})
    t = 263.45
    V(t, bg='room', under=[['rehal', 700, 900, 1.2], ['rehal', 1200, 900, 1.2]], figs=[F(700, 900, 0.62, 'girl', seated=True, expr='focus', lookY=0.6, seed=44), F(1200, 900, 0.62, 'girl', seated=True, expr='focus', lookY=0.6, seed=45)], fx=[TG('медресе: можно', w('медресе', t), 960, 160, 84, '#bfe8b0'), ['ok', w('можно', t), 1600, 300]], mv={'r': 0.04})
    t = 267.75
    V(t, bg='room', under=[['rehal', 960, 900, 1.6]], figs=[F(960, 900, 0.9, 'girl', seated=True, expr='calm', bow=0, nods=[t + 0.2, t + 0.7, t + 1.2], seed=44)], view=[960, 700, 1.5], mv={'r': 0.05})
    t = 269.15
    V(t, 'impact', bg='classroom', bo={'board': [{'t': 'x² + 2x = 8', 'at': 0.0, 'cps': 20}]}, view=[760, 340, 1.4], fx=[['stamp', w('нельзя', t), 760, 340, 160], TX('алгебра: нельзя', w('нельзя', t), 960, 900, 110, '#ff8a7a')], mv={'r': 0.05})
    t = 271.15
    V(t, 'whip2', bg='radioClose', fx=[TG('радио «Бегум»', w('Бегум', t) - 0.3, 960, 150, 84, YEL)], mv={'r': 0.05, 'kick': 1})
    t = 273.4
    V(t, bg='room', figs=[F(900, 1000, 0.95, 'teacher', seated=False, pose='hold', holdR='mic', mouthKeys=[[0, 1]], expr='smile', look=1, scarf='#8a3a5a')], fx=[['plate', w('основала', t), 1450, 300, 'в эфире', '#e2483a'], ['burst', [t + 0.5, t + 1.5], 1130, 550, 'lines', {'n': 8, 'grav': 0, 'size': 10, 'dir': 0, 'spread': 1}], TG('журналистка', w('журналистка', t), 960, 150, 72)], mv={'r': 0.04})
    t = 276.35
    V(t, bg='radioClose', bo={'night': 1}, fx=[['dim', [[0, 0], [w('закрывали', t), 0.6]]], TG('2025', w('двадцать', t), 960, 150, 90, YEL), ['stamp', w('закрывали', t) + 0.1, 960, 560, 160]], mv={'r': 0.04, 'kick': 1}, sfx=[[w('закрывали', t) + 0.1, 'hit', -14]])
    t = w('но', 278.5) - 0.05
    V(t, bg='radioClose', fx=[['burst', w('эфир', t), 960, 500, 'sparkle', {'n': 20}], TX('снова в эфире', w('эфир', t), 960, 900, 110, YEL)], mv={'r': 0.05}, sfx=[[w('эфир', t), 'shimmer', -18]])
    t = 281.55
    V(t, 'whip2', bg='radioClose', bo={'tv': 1}, fx=[TG('телеканал из Франции', w('Франции', t) - 0.5, 960, 120, 76, YEL)], mv={'r': 0.04})
    t = 285.1
    V(t, bg='radioClose', bo={'tv': 1}, view=[840, 480, 1.3], fx=[CN(w('седьмого', t), 7, 12, 960, 860, size=130, suf=' класс', dur=1.2, pre='с 7 по ')], mv={'r': 0.05})
    t = 287.95
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 900, 1.0, 'girl', expr='sad', lookY=0.4, tearAt=t + 0.8)], view=[960, 540, 1.8], mv={'r': 0.05, 'kick': 1})
    t = 290.0
    V(t, bg='blanket', mv={'r': 0.05, 'kick': 1}, fx=[TG('ночью', w('ночью', t), 960, 150, 76)])
    t = w('под', 292) - 0.1
    V(t, bg='room', bo={'night': 1}, figs=[F(560, 900, 0.8, 'mother', seated=True, eyesShut=True, expr='calm', tilt=0.15), F(960, 900, 0.8, 'father', seated=True, eyesShut=True, expr='calm', tilt=-0.12), F(1360, 900, 0.7, 'brother', seated=True, eyesShut=True, expr='calm', tilt=0.2)], fx=[TX('z z z', t + 0.3, 1000, 360, 90, '#cfe0ff'), TG('все спят', w('спят', t), 960, 150, 72)], over=[['dim', [[0, 0.35]]]], mv={'r': -0.035})
    t = 295.3
    V(t, bg='blanket', view=[1110, 740, 1.6], fx=[TX('тонкая ниточка', w('тонкая', t), 960, 160, 100)], mv={'r': 0.05})
    t = 298.15; ot = w('отключали', t)
    V(t, 'whip2', bg='afgMap', bo={'k': 0}, fx=[['dots', t + 0.1, 30, 700, 280, 700, 460], ['dim', [[0, 0], [ot, 0.7]]], TG('осень 2025', w('Осенью', t), 960, 150, 80, YEL), TX('нет сети', w('связь', t), 960, 560, 160, '#ff8a7a')], mv={'r': 0.04}, sfx=[[ot, 'glitch', -14]])
    t = 303.5
    V(t, bg='blanket', bo={'noNet': 1}, fx=[CN(w('двое', t), 0, 48, 960, 170, size=150, suf=' часов', dur=0.9, unit='без связи', usize=72)], mv={'r': 0.05, 'kick': 1})
    t = 305.2
    V(t, bg='map', bo={'view': [-12, 25, 80, 62], 'hl': {'AFG': '#e2483a'}}, fx=[['route', [-12, 25, 80, 62], [69.2, 34.5], [2.3, 48.8], t + 0.3, 1.2, 'за границей']], mv={'r': 0.04})
    t = 307.6
    V(t, bg='football', figs=[F(500, 1000, 0.7, 'player', walk={'x0': 200, 'x1': 900, 'at': t, 'dur': 2.5, 'lin': 1}, expr='laugh'), F(1300, 1010, 0.7, 'player', walk={'x0': 1700, 'x1': 1200, 'at': t + 0.5, 'dur': 2.0}, expr='smile', seed=51, skin='#d8a070'), F(1000, 1000, 0.7, 'player', poses=[[0, 'idle'], [w('собрали', t), 'cheer']], expr='smile', seed=52)], fx=[TG('своя команда', w('команду', t), 960, 160, 80, YEL)], mv={'r': 0.03, 'px': 40})
    t = 312.7; fi = w('ФИФА', t)
    V(t, bg='football', figs=[F(1000, 1010, 0.9, 'player', poses=[[0, 'idle'], [fi, 'cheer']], expr='laugh', seed=51, skin='#d8a070', jumpAt=[fi + 0.1, fi + 1.0])], fx=[TG('апрель 2026', w('апреле', t), 960, 150, 80, YEL), TX('ФИФА: можно', w('разрешила', t), 960, 330, 130, '#ffffff'), ['burst', [fi + 0.2, fi + 1.1], 1000, 500, 'stars', {'n': 22}]], mv={'r': 0.05, 'kick': 1}, sfx=[[fi + 0.2, 'cheer', -20, 2.5]])
    t = 317.4
    V(t, bg='radioClose', bo={'night': 1}, fx=[TG('по радио', t + 0.2, 960, 150, 76)], mv={'r': 0.05, 'kick': 1})
    t = 318.85
    V(t, bg='room', bo={'night': 1}, figs=[F(900, 900, 1.0, 'girl', seated=True, expr='laugh', look=0.4, lookY=-0.4)], fx=[['clockspin', 1500, 300, 120, t + 0.2, 1.5], ['burst', t + 0.4, 900, 300, 'stars', {'n': 12}]], view=[1060, 520, 1.3], mv={'r': 0.04})
    card(320.69, 15, 18, 'Закрытая дверь')
    # ---------------------------------------------------------------- 18 ЛЕТ
    t = 323.35; vr = w('врачом', t)
    V(t, bg='university', figs=[F(700, 1000, 0.8, 'heroine', expr='smile', lookY=-0.5, look=1)], panels=[{'at': vr - 0.1, 'x': 1060, 'y': 80, 'w': 760, 'h': 480, 'bg': 'midwife', 'figs': [F(960, 980, 1.0, 'heroine', coat='#f4f4ee', shirt='#f4f4ee', holdR='steth', pose='hold', expr='laugh')], 'fy': 600}], fx=[TG('18 лет', t + 0.1, 230, 150, 80, YEL)], mv={'r': 0.04})
    t = 325.7; nz = w('нельзя', t)
    V(t, 'impact', bg='university', bo={'locked': {'kv': [[0, 0], [nz, 1]], 'd': 0.1}}, figs=[F(960, 1000, 0.8, 'heroine', exprs=[[0, 'smile'], [nz, 'shock'], [nz + 0.8, 'sad']], sweatAt=nz + 0.2)], fx=[TG('декабрь 2022', w('декабря', t), 960, 150, 84, YEL), ['chain', nz, 960, 600, 300], TX('университет: нельзя', nz + 0.2, 960, 380, 100, '#ff8a7a')], mv={'r': 0.04, 'shake': [[nz - t, 10]]}, sfx=[[nz, 'hit', -12]])
    t = 330.9
    V(t, bg='street', figs=[F(960, 1010, 0.8, 'aunt', walk={'x0': -200, 'x1': 960, 'at': t, 'dur': 1.4}, expr='focus', holdR='folder', pose='hold')], fx=[TG('последний путь', w('последний', t), 960, 160, 84, YEL)], mv={'r': 0.03, 'px': 35})
    t = 334.05
    V(t, 'whip2', bg='midwife', fx=[TG('курсы медсестёр и акушерок', w('курсы', t), 960, 140, 72, YEL)], mv={'r': 0.05, 'kick': 1})
    t = 336.25
    V(t, bg='midwife', figs=[F(960, 960, 0.9, 'aunt', walk={'x0': -200, 'x1': 960, 'at': t, 'dur': 0.9}, expr='laugh', jumpAt=t + 1.0)], fx=[['burst', t + 1.05, 960, 400, 'stars', {'n': 16}]], mv={'r': 0.04})
    t = 337.65; st2 = w('стетоскоп', t)
    V(t, bg='midwife', figs=[F(960, 1000, 1.05, 'aunt', poses=[[0, 'hold'], [st2, 'chin']], holdR='steth', exprs=[[0, 'focus'], [st2, 'laugh']])], view=[960, 520, 1.5], fx=[['burst', st2 + 0.1, 1060, 380, 'sparkle', {'n': 18}], TG('стетоскоп', st2, 960, 160, 80, YEL)], mv={'r': 0.05, 'kick': 1})
    t = 341.5
    V(t, bg='midwife', bo={'closed': 0}, figs=[F(960, 960, 0.9, 'aunt', expr='worried', look=-0.5)], fx=[TG('декабрь 2024', w('декабре', t), 960, 150, 84, YEL), TG('по сообщениям СМИ', w('сообщениям', t), 960, 900, 66)], mv={'r': 0.04, 'kick': 1})
    t = w('власти', 344) - 0.1
    V(t, bg='midwife', bo={'closed': 1}, figs=[F(700 + k * 250, 960, 0.75, ['aunt', 'neighbor', 'girl'][k], walk={'x0': 700 + k * 250, 'x1': -500, 'at': w('закрыть', t) + k * 0.3, 'dur': 2.0, 'lin': 1}, expr='sad', holdR='handbag', pose='hold', seed=70 + k) for k in range(3)], fx=[['stamp', w('закрыть', t), 1500, 300, 110]], mv={'r': 0.03, 'px': -40}, sfx=[[w('закрыть', t), 'hit', -14]])
    t = 349.3
    V(t, bg='lawDesk', fx=[TX('указ?', w('указа', t), 960, 520, 220, '#2b6a4a'), TX('?', w('показали', t), 1500, 420, 260, '#e2483a')], mv={'r': 0.04})
    t = 351.35; c35 = w('тридцати', t)
    V(t, bg='icons', bo={'n': 35, 'rows': 5, 'frac': 1.0, 'col': '#2b6a4a', 'at': c35 - 0.1}, fx=[CN(c35, 0, 35000, 960, 140, size=150, pre='≈ ', dur=1.2, unit='девушек потеряли учёбу', uy=690, usize=78)], mv={'r': 0.035, 'kick': 1}, sfx=[[c35, 'counter', -15]])
    t = 354.95; pr = w('принесла', t)
    V(t, bg='room', bo={'night': 1}, figs=[F(760, 900, 0.95, 'aunt', poses=[[0, 'hold'], [pr + 0.2, 'reach']], holdKeys=[[0, 'notes'], [pr + 0.5, None]], expr='sad', look=1), F(1160, 900, 0.9, 'heroine', poses=[[0, 'idle'], [pr + 0.4, 'hold']], holdKeys=[[0, None], [pr + 0.5, 'notes']], expr='focus', look=-1)], view=[960, 560, 1.3], fx=[TG('конспекты', w('конспекты', t), 960, 160, 80, YEL)], mv={'r': 0.05})
    t = 357.4
    V(t, bg='secretClass', figs=[F(960, 900, 0.95, 'heroine', seated=True, pose='write', holdR='pen', expr='focus', lookY=0.6)], view=[960, 560, 1.3], mv={'r': 0.05, 'kick': 1})
    t = 359.3
    V(t, bg='room', figs=[F(960, 880, 1.0, 'mother', seated=True, expr='worried', look=0.2, nods=[t + 0.9])], view=[960, 520, 1.7], mv={'r': 0.06})
    t = 361.85
    V(t, bg='midwife', figs=[F(760, 960, 0.85, 'aunt', coat='#f4f4ee', shirt='#f4f4ee', holdR='steth', pose='hold', expr='smile', look=1), F(1160, 960, 0.8, 'mother', expr='calm', look=-1)], fx=[TG('женщин лечат женщины', w('лечат', t), 960, 150, 76, YEL)], mv={'r': 0.04, 'px': 25})
    t = 366.0; kt = w('кто', t)
    V(t, bg='midwife', bo={'closed': 1}, fx=[TX('?', kt, 960, 520, 360, YEL), TG('кто примет роды?', w('роды', t), 960, 160, 76)], mv={'r': 0.05, 'kick': 1})
    t = 370.55
    V(t, 'whip2', bg='courtyard', bo={'night': 1}, figs=[F(960, 920, 0.85, 'granny', expr='calm', mouthKeys=[[0, 1]])], fx=[['burst', [t + 0.3, t + 1.3, t + 2.3, t + 3.3], 1040, 420, 'notes', {'n': 3, 'speed': 220, 'grav': -60, 'dir': -1.0, 'spread': 0.9, 'size': 22, 'life': 1.4}]], mv={'r': 0.04})
    t = 374.8
    V(t, bg='black', fx=[['type', 'не пускаешь меня учиться,', 960, 430, 110, w('не', 376), {}], ['type', 'значит, я не стану врачом', 960, 600, 110, w('значит', 376), {'col': YEL}]], mv={'r': 0.03}, vig=0)
    t = 379.8; zb = w('заболеешь', t)
    V(t, bg='room', bo={'night': 1}, figs=[F(1100, 870, 0.9, 'father', seated=True, expr='tired', sweatAt=zb, eyesShut=True, tilt=0.25)], under=[['bed', 1100, 920, 700]], fx=[['dim', [[0, 0.25]]]], mv={'r': 0.04, 'kick': 1})
    t = 382.1
    V(t, bg='room', figs=[F(960, 900, 1.0, 'heroine', expr='worried', look=0.3)], view=[960, 520, 1.6], fx=[TG('18 лет', w('восемнадцати', t), 960, 160, 84, YEL), ['sweat', t + 0.8, 1080, 300, 1.4]], mv={'r': 0.05})
    t = 384.5; tr = w('три', t)
    V(t, bg='paper', fx=[['iconrow', 10, 285, 720, 150, 1.25, {'hi': [0, 1, 2], 'at': tr, 'step': 0.15, 'col': '#c84a6a'}], TX('≈ 3 из 10', tr, 960, 300, 170, '#c84a6a'), TG('замужем раньше 18', w('замуж', t), 960, 930, 72)], mv={'r': 0.04, 'kick': 1}, sfx=[[tr + 0.15 * k, 'pop', -16] for k in range(3)])
    t = 389.1
    V(t, 'drop', bg='lawDesk', fx=[TG('указ 2026', w('двадцать', t), 960, 220, 84, YEL), ['plate', w('называет', t) - 0.4, 960, 560, 'возраст брака: ___', '#f6f1e4'], TX('?', w('минимального', t), 1500, 560, 220, '#e2483a')], mv={'r': 0.045})
    t = 394.4
    V(t, bg='room', figs=[F(760, 900, 0.95, 'mother', seated=True, expr='worried', look=1, talk=True), F(1160, 900, 0.95, 'father', seated=True, expr='worried', look=-1, nods=[395.6])], mv={'r': 0.04, 'kick': 1})
    t = 397.15
    V(t, bg='room', figs=[F(960, 900, 1.0, 'father', seated=True, expr='sad', lookY=0.6, tilt=0.1)], view=[960, 520, 1.7], mv={'r': 0.05})
    t = 399.8
    V(t, bg='room', figs=[F(860, 900, 1.0, 'mother', pose='hug', expr='sad', eyesShut=True, turn=0.4), F(1100, 900, 0.85, 'heroine', pose='hug', flip=True, expr='sad', turn=0.4)], view=[980, 560, 1.3], fx=[TG('учёба', w('учёбы', t), 420, 300, 76), ['stamp', w('учёбы', t) + 0.2, 420, 300, 80], TG('работа', w('работы', t), 1500, 300, 76), ['stamp', w('работы', t) + 0.2, 1500, 300, 80], TG('защита?', w('защитой', t), 960, 160, 80, YEL)], mv={'r': 0.04})
    t = 404.95
    V(t, 'whip2', bg='henna', fx=[TG('ночь хны', w('хны', t), 960, 150, 90, YEL)], tint='pink', mv={'r': 0.05, 'kick': 1})
    t = 408.4
    V(t, bg='room', bo={'night': 1}, figs=[F(560 + k * 400, 900, 0.8, ['granny', 'mother', 'aunt'][k], seated=True, expr='calm', mouthKeys=[[0, 1]], seed=80 + k) for k in range(3)], fx=[['burst', [t + 0.3, t + 1.1, t + 1.9], 960, 420, 'notes', {'n': 4, 'speed': 240, 'grav': -40, 'size': 20, 'life': 1.3}]], mv={'r': 0.03, 'px': 30})
    t = w('тебе', 410.5) - 0.1
    V(t, bg='henna', view=[960, 700, 1.4], mv={'r': 0.05})
    t = 413.4
    V(t, bg='courtyard', bo={'blossom': 1}, figs=[F(760, 920, 0.85, 'heroine', expr='smile', look=1, scarf='#c84a6a', lookKeys=[[0, 1]], turnKeys=[[0, 0.3]]), F(1200, 920, 0.85, 'husband', expr='smile', look=-1)], fx=[TG('второй раз', w('второй', t), 960, 160, 80, YEL)], mv={'r': 0.04, 'kick': 1})
    t = 415.7; sh = w('шутить', t)
    V(t, bg='courtyard', bo={'blossom': 1}, figs=[F(760, 920, 0.95, 'heroine', exprs=[[0, 'smile'], [sh, 'laugh']], poses=[[0, 'idle'], [sh + 0.1, 'hush']], scarf='#c84a6a', look=1), F(1180, 920, 0.95, 'husband', poses=[[0, 'chin'], [sh - 0.3, 'shrug']], expr='smile', look=-1)], view=[960, 560, 1.3], fx=[['burst', sh + 0.2, 760, 380, 'hearts', {'n': 10}]], mv={'r': 0.05})
    t = 418.25
    V(t, bg='courtyard', bo={'blossom': 1}, figs=[F(860, 920, 0.85, 'heroine', expr='calm', scarf='#c84a6a', look=1), F(1100, 920, 0.85, 'husband', expr='smile', look=-1)], fx=[['burst', t + 0.4, 980, 300, 'hearts', {'n': 14}]], tint='pink', mv={'r': -0.035})
    t = 421.1
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 900, 0.95, 'heroine', expr='worried', look=-0.6)], view=[960, 540, 1.5], mv={'r': 0.05, 'kick': 1})
    t = 422.75
    V(t, bg='room', bo={'night': 1}, figs=[F(800, 900, 0.95, 'father', seated=True, expr='smile', pose='hold', holdR='book', look=1, talkKeys=[[0, 1], [424.3, 0]]), F(1180, 900, 0.65, 'girl', seated=True, expr='focus', look=-1, talkKeys=[[0, 0], [424.3, 1]])], fx=[['glow', 960, 300, 400]], mv={'r': 0.04, 'px': 25})
    t = 425.85; zk = w('закрыли', t)
    V(t, 'whip2', bg='university', bo={'locked': {'kv': [[0, 0], [zk, 1]], 'd': 0.1}}, fx=[TG('2022', w('втором', t), 960, 150, 84, YEL), ['chain', zk, 960, 600, 300]], mv={'r': 0.04, 'kick': 1})
    t = 429.0
    V(t, bg='university', figs=[F(640 + k * 320, 1000, 0.75, 'mstudent', walk={'x0': 640 + k * 320 + (900 if k == 2 else -900), 'x1': 640 + k * 320, 'at': w('вышли', t) - 1.4 + k * 0.2, 'dur': 1.2}, expr='angry', seed=27 + k, holdR='notes', pose='hold', skin=['#f1c8a2', '#d8a070', '#e2b48a'][k], beard=k == 2) for k in range(3)], fx=[TG('в знак протеста', w('протеста', t), 960, 150, 80, YEL), ['burst', w('экзаменов', t), 960, 560, 'lines', {'n': 12, 'grav': 0}]], mv={'r': 0.03, 'px': -35})
    # ---------------------------------------------------------------- 40 ЛЕТ (продолжение после теста)
    t = 550.16
    V(t, 'dipWhite', bg='room', bo={'night': 1}, figs=[F(800, 900, 1.0, 'granny', seated=True, expr='calm', mouthKeys=[[0, 1]], look=0.6), F(1180, 900, 0.62, 'girl', seated=True, expr='smile', look=-1)], fx=[['burst', [t + 0.4, t + 1.3, t + 2.2], 900, 420, 'notes', {'n': 3, 'speed': 220, 'grav': -60, 'dir': -1, 'spread': 0.9, 'size': 22, 'life': 1.4}], TG('ландаи', w('ландаи', t), 960, 160, 80, YEL)], tint='sepia', mv={'r': 0.04})
    t = 553.7
    V(t, 'dipWhite', bg='room', bo={'night': 1}, figs=[F(800, 900, 1.0, 'heroine', seated=True, expr='calm', mouthKeys=[[0, 1]], look=0.6), F(1180, 900, 0.7, 'girl', seated=True, expr='smile', look=-1, seed=46)], fx=[['burst', [t + 0.3, t + 1.2, t + 2.1], 900, 420, 'notes', {'n': 3, 'speed': 200, 'grav': -60, 'dir': -1, 'spread': 0.9, 'size': 22, 'life': 1.4}]], mv={'r': 0.04})
    t = 556.8
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 900, 1.0, 'heroine', seated=True, poses=[[0, 'hush']], expr='calm', mouth=0.2)], view=[960, 520, 1.9], fx=[TX('шёпотом', t + 0.1, 960, 990, 100)], mv={'r': 0.06, 'kick': 1})
    t = 557.6
    V(t, bg='secretClass', figs=[F(760, 900, 0.75, 'girl', seated=True, expr='focus', lookY=0.4, seed=46, talkKeys=[[0, 0], [w('читать', t), 1]]), F(1160, 900, 1.0, 'heroine', seated=True, expr='smile', pose='point', look=-1, nods=[w('учишь', t)])], fx=[['glow', 960, 260, 380, '255,220,150', 0.5], TG('при лампе', w('лампе', t), 960, 150, 76)], mv={'r': 0.04})
    t = 561.25; ra = w('рада', t)
    V(t, 'whip2', bg='university', figs=[F(1100, 1000, 0.8, 'mstudent', poses=[[0, 'idle'], [w('поступил', t), 'cheer']], expr='laugh', jumpAt=w('университет', t)), F(700, 1000, 0.8, 'heroine', walk={'x0': -200, 'x1': 880, 'at': w('и', t + 1.5), 'dur': 1.0}, poses=[[0, 'idle'], [ra - 0.3, 'hug']], expr='laugh')], fx=[TG('поступил!', w('поступил', t), 1100, 300, 80, YEL), ['burst', [w('университет', t), ra], 1000, 400, 'stars', {'n': 18}]], mv={'r': 0.04, 'px': 25}, sfx=[[w('университет', t), 'ding', -18]])
    t = 566.75
    V(t, bg='secretClass', figs=[F(960, 900, 0.95, 'girl', seated=True, pose='write', holdR='pen', expr='focus', lookY=0.6, seed=46)], under=[['stack', [t + 0.3, t + 0.6, t + 0.9], 1450, 860]], fx=[TG('учебники брата', w('учебников', t), 1450, 560, 66)], view=[1100, 600, 1.2], mv={'r': 0.05, 'kick': 1})
    t = 569.8
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 920, 1.05, 'girl', seated=True, pose='hold', holdR='notes', expr='smile', lookY=0.5, seed=46)], view=[1030, 640, 1.6], fx=[TG('тётины конспекты', w('конспектам', t), 960, 160, 76, YEL)], mv={'r': 0.05})
    card(571.85, 40, 60, 'Бабушка')
    t = 574.5
    V(t, bg='room', figs=[F(960, 900, 1.0, 'heroOld', seated=True, expr='smile', pose='tea', holdR='baby')], view=[960, 560, 1.3], mv={'r': 0.05, 'kick': 1})
    t = 575.95; c68 = w('шестидесяти', t)
    V(t, bg='paper', fx=[CN(c68, 0, 68, 960, 460, size=260, pre='≈ ', suf=' лет', dur=1.2), TG('средняя жизнь женщины', c68 + 0.6, 960, 760, 76, YEL)], mv={'r': 0.04}, sfx=[[c68, 'counter', -15]])
    t = 579.65
    V(t, bg='room', figs=[F(960, 900, 1.0, 'heroOld', seated=True, expr='laugh', pose='tea', holdR='baby', nods=[580.2])], view=[960, 520, 1.6], fx=[['burst', 580.0, 960, 300, 'hearts', {'n': 12}]], tint='pink', mv={'r': 0.05})
    t = 580.85; vy = w('выбираешь', t)
    V(t, bg='room', figs=[F(560, 900, 0.85, 'heroine', seated=True, expr='worried', scarf='#c84a6a', shakes=[581.4], look=1), F(960, 900, 0.9, 'heroOld', seated=True, poses=[[0, 'idle'], [vy, 'point']], exprs=[[0, 'smile'], [vy, 'laugh']]), F(1360, 900, 0.85, 'brother', seated=True, beard=True, expr='worried', look=-1)], fx=[['burst', vy + 0.2, 960, 300, 'stars', {'n': 20}], TG('имя!', vy, 960, 170, 84, YEL)], mv={'r': 0.04}, sfx=[[vy + 0.2, 'ding', -18]])
    t = 583.35
    V(t, 'whip2', bg='timeline', bo={'items': [['1960-е', 'парламент', 560, 0.3], ['2002', 'снова в школе', 1360, 1.0]]}, fx=[TG('правила менялись', w('менялись', t), 960, 170, 80, YEL)], mv={'r': 0.03, 'px': 30})
    t = 585.5
    V(t, bg='auditorium', figs=[F(500 + k * 300, 1000, 0.75, 'student70', walk={'x0': -400 + k * 300, 'x1': 500 + k * 300, 'at': t + k * 0.2, 'dur': 1.6}, expr='smile', seed=26 + k, coat=['#4a7a9a', '#8a5a4a', '#5a7a4a'][k]) for k in range(3)], under=[['podium', 1500, 980]], fx=[TG('1960-е: парламент', w('парламент', t), 960, 150, 80, YEL)], tint='sepia', mv={'r': 0.04})
    t = 588.3
    V(t, bg='gate', figs=[F(500 + k * 260, 1000, 0.6, 'girl', walk={'x0': -300 - k * 200, 'x1': 700 + k * 200, 'at': t + 0.2 + k * 0.15, 'dur': 1.8}, pack='#3a6aa8', expr='laugh', seed=31 + k) for k in range(3)], fx=[TG('2002', w('двухтысячных', t), 960, 150, 90, YEL)], mv={'r': 0.04, 'kick': 1})
    t = 591.75
    V(t, bg='classroom', bo={'board': [{'t': 'нельзя', 'at': 0.1, 'cps': 10}]}, figs=[F(1150, 940, 0.75, 'girl', pose='point', expr='focus', look=-1, seed=46)], view=[860, 520, 1.2], mv={'r': 0.05})
    t = 593.35; pe = w('переписать', t)
    V(t, bg='classroom', figs=[F(1150, 940, 0.75, 'girl', poses=[[0, 'point'], [pe, 'cheer']], expr='laugh', look=-1, seed=46)], view=[860, 520, 1.2], fx=[['board', t, 'нельзя', 760, 340, 90, 0, '#ff8a7a'], ['stamp', w('люди', t), 760, 340, 120], ['board', pe, 'можно', 760, 460, 110, 10, '#bfe8b0'], ['burst', pe + 0.3, 760, 460, 'stars', {'n': 16}]], mv={'r': 0.05}, sfx=[[pe + 0.3, 'ding', -18]])
    card(595.29, 0, 0, 'Финал')
    t = 597.95
    V(t, bg='room', bo={'night': 1}, fx=[['clockspin', 960, 520, 230, t + 0.1, 3.0]], mv={'r': 0.05, 'kick': 1})
    t = 600.8; mi = w('Миллионы', t)
    V(t, bg='icons', bo={'n': 60, 'rows': 5, 'frac': 1.0, 'col': '#e2483a', 'at': mi}, fx=[TX('миллионы девочек', mi, 960, 140, 120, YEL), TG('прямо сейчас', w('сейчас', t), 960, 960, 76)], mv={'r': 0.04})
    t = 604.15
    def pp(k, word, bg, bo=None, figs=None): return {'at': w(word, t) - 0.08, 'x': 30 + k * 470, 'y': 250, 'w': 450, 'h': 560, 'bg': bg, 'bo': bo or {}, 'figs': figs or []}
    V(t, bg='color', bo={'col': '#1e1a26'}, panels=[pp(0, 'школу', 'gate', {'close': 1}), pp(1, 'работу', 'salonRow', {'shut': [1, 1, 1]}), pp(2, 'парки', 'park'), pp(3, 'голос', 'room', {'night': 1}, [F(960, 980, 1.0, 'heroine', seated=True, pose='hush', expr='sad')])],
      fx=[TG(x, w(wd, t), 255 + k * 470, 900, 70) for k, (x, wd) in enumerate([('школа', 'школу'), ('работа', 'работу'), ('парки', 'парки'), ('голос', 'голос')])], mv={'r': 0.025}, sfx=[[w(x, t), 'whoosh', -16, 0.35] for x in ('школу', 'работу', 'парки', 'голос')])
    t = 609.25
    V(t, 'impact', bg='room', figs=[F(960, 900, 1.0, 'girl', expr='focus', poses=[[0, 'idle'], [t + 0.5, 'fist']], nods=[t + 1.2])], view=[960, 520, 1.6], mv={'r': 0.05})
    t = 612.1
    V(t, bg='room', figs=[F(960, 900, 1.0, 'girl', expr='smile')], view=[960, 480, 1.7], fx=[['burst', [t + 0.3, t + 1.2], 960, 250, 'sparkle', {'n': 18, 'grav': 40}]], mv={'r': 0.05})
    t = 614.75
    V(t, bg='secretClass', figs=[F(960, 900, 0.9, 'girl', seated=True, pose='write', holdR='pen', expr='focus', lookY=0.5)], fx=[['glow', 960, 260, 380, '255,220,150', 0.5], TG('буквы при лампе', t + 0.2, 960, 150, 76)], view=[960, 560, 1.3], mv={'r': 0.05, 'kick': 1})
    t = 616.95
    V(t, bg='radioClose', bo={'night': 1}, fx=[TG('урок по радио', t + 0.1, 960, 150, 76)], mv={'r': 0.06})
    t = 618.55
    V(t, bg='room', bo={'night': 1}, figs=[F(960, 920, 1.05, 'aunt', seated=True, pose='hold', holdR='notes', expr='smile', lookY=0.5)], view=[1030, 640, 1.6], fx=[TG('конспекты', t + 0.1, 1500, 960, 76, YEL)], mv={'r': 0.06, 'kick': 1})
    t = 620.05
    V(t, bg='courtyard', bo={'night': 1}, figs=[F(960, 920, 0.95, 'granny', expr='calm', mouthKeys=[[0, 1]])], fx=[['burst', [t + 0.2, t + 1.0], 1060, 420, 'notes', {'n': 3, 'speed': 220, 'grav': -60, 'dir': -1, 'spread': 0.9, 'size': 22, 'life': 1.3}], TG('песни из 2 строк', t + 0.2, 960, 150, 76)], mv={'r': 0.05})
    t = 622.0
    V(t, bg='room', figs=[F(960, 900, 1.0, 'heroOld', seated=True, expr='calm', lookY=0.2, nods=[623.0])], view=[960, 520, 1.5], mv={'r': -0.035})
    t = 624.0
    V(t, bg='classroom', bo={'board': [{'t': '7 × 8 = 56', 'at': 0.3, 'cps': 12}]}, figs=[F(1100, 940, 0.62, 'girl', pose='point', expr='laugh', look=-1, seed=46), F(1650, 960, 0.7, 'heroOld', seated=True, expr='laugh', nods=[625.5])], under=[['deskrow', [1650]]], fx=[['burst', w('умножения', t), 760, 330, 'stars', {'n': 14}]], mv={'r': 0.04})
    t = 626.3
    V(t, 'whip2', bg='midwife', figs=[F(960, 960, 0.9, 'girl', seed=46, poses=[[0, 'idle'], [w('врачи', t), 'hold']], holdKeys=[[0, None], [w('врачи', t), 'steth']], coat={'kv': [[0, 0]]} and '#f4f4ee', shirt='#f4f4ee', expr='laugh')], fx=[TG('свои врачи', w('врачи', t), 960, 160, 80, YEL), ['burst', w('врачи', t) + 0.1, 960, 400, 'sparkle', {'n': 16}]], mv={'r': 0.04, 'kick': 1})
    t = 630.45
    V(t, bg='secretClass', figs=[F(560, 900, 0.7, 'girl', seated=True, expr='focus', look=0.5, lookY=0.4, seed=41), F(800, 900, 0.7, 'girl', seated=True, expr='focus', seed=42, skin='#d8a070', look=0.3, lookY=0.4), F(1340, 900, 0.95, 'aunt', pose='point', expr='smile', look=-1)], fx=[['glow', 960, 260, 400, '255,220,150', 0.5]], mv={'r': 0.03, 'px': 30})
    t = 634.45
    V(t, bg='secretClass', figs=[F(560 + k * 260, 900, 0.62, 'girl', seated=True, expr='focus', lookY=0.5, seed=41 + k, mouthKeys=[[0, 1]]) for k in range(4)], fx=[TG('шёпотом', w('шёпотом', t), 960, 160, 80)], mv={'r': 0.04})
    t = 639.3
    V(t, 'impact', bg='secretClass', figs=[F(960, 920, 1.0, 'girl', seated=True, pose='write', holdR='pen', expr='focus', lookY=0.5)], view=[960, 560, 1.5], fx=[TX('но учатся', t + 0.15, 960, 900, 150, YEL)], mv={'r': 0.05})
    t = 641.15
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(960, 920, 0.7, 'girl', expr='smile', lookY=-1, look=0.3)], mv={'r': -0.035, 'py': -20})
    t = 645.45
    V(t, bg='courtyard', bo={'kites': 1}, under=[['dim', [[0, 0.3]]]], fx=[['plate', w('Школу', t), 420, 540, 'школа', '#f6f1e4'], ['plate', w('работу', t), 960, 540, 'работа', '#f6f1e4'], ['plate', w('голос', t), 1500, 540, 'голос', '#f6f1e4']], mv={'r': 0.04}, sfx=[[w(x, t), 'pop', -16] for x in ('Школу', 'работу', 'голос')])
    t = 647.95
    V(t, bg='courtyard', bo={'kites': 1}, figs=[F(640, 920, 0.65, 'girl', expr='laugh', pose='point', look=1)], fx=[TG('напиши в комментариях', t + 0.15, 1200, 300, 80, YEL), ['arrow', t + 0.4, 1200, 420, 1300, 820]], mv={'r': 0.04})
    t = 649.26
    V(t, 'dip', bg='courtyard', bo={'night': 1}, fx=[['dim', [[0, 0.45]]], TX('МЫСЛЕННЫЙ', t + 0.4, 960, 400, 150), TX('ЭКСПЕРИМЕНТ', t + 0.8, 960, 580, 150, YEL)], mv={'r': 0.03})
