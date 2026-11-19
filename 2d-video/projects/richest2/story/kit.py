# Помощники раскадровки: S(...) — сцена stage, A — герой, P — предмет, G — бирка, card — чёрная карточка.
def S(set, cast=(), props=(), tags=(), cam=None, **kw):
    d = dict(set=set, cast=list(cast), props=list(props), tags=list(tags), **kw)
    if cam: d['cam'] = cam
    return ('stage', d)
def A(c, x, y=930, **kw): return dict(c=c, x=x, y=y, **kw)
def P(k, x, y, **kw): return dict(k=k, x=x, y=y, **kw)
def G(t, x, y, at=0.2, **kw): return dict(t=t, x=x, y=y, at=at, **kw)
def card(text, gold=()): return ('card', {'text': text, 'gold': list(gold)})
def B(text, x, y, at, **kw): return dict(text=text, x=x, y=y, at=at, **kw)
