# Часть E: рисованные анимации там, где нет настоящих кадров (rework/anim_*.py -> cache/anim_*.mp4).
def apply(ns):
    M = ns['M']
    ns['SHOTS'].update({
        'a03': M('anim_cracks'), 'a04': M('anim_cracks'),
        'j11': M('anim_cracks2'),
        'f11': M('anim_evac'), 'f12': M('anim_evac'),
        'j14': M('anim_heatcut'), 'j15': M('anim_heatcut'),
        'o17': M('anim_loans'), 'o18': M('anim_loans'),
    })
