# chapter sound stems (copied into each chapter folder by render_all.sh): vo.wav (voice at the cue times) + fx.wav (SFX x 0.3)
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../kit')); import sfx; sfx.stems(__file__)
