# Исходники и раскадровка пилота «Норвегия» v2.
# MEDIA: ключ → файл, что/где снято, автор, лицензия, страница (из commons_meta.json для Wikimedia Commons).
# SHOTS: ключ склейки из script.py → какой исходник и как его показать:
#   m — исходник, ss — с какой секунды, crop — кадрирование (x, y, w, h в долях), kb — наезд по фото (z0, z1, (fx0, fy0), (fx1, fy1)),
#   map/gfx — анимация из maps.py / gfx_depth.py, loc — плашка «где это», txt/sub — цифра и что она значит.
import json, os
D = os.path.dirname(os.path.abspath(__file__))
_C = json.load(open(os.path.join(D, 'commons_meta.json')))

def c(title, what, place):
    m = dict(_C['File:' + title]); m.update(what=what, place=place, source='Wikimedia Commons'); return m

def mk(i, what, place, title):
    return dict(file=f'clips/{i}.mp4', what=what, place=place, author='Mixkit', license='Mixkit Stock Video Free License',
                license_url='https://mixkit.co/license/#videoFree', page=f'https://mixkit.co/ (видео {i}: «{title}»)', source='Mixkit')

MEDIA = {
  # --- видео ---
  'mk_coast':    mk(8657, 'закатный пролёт над скалистым берегом', 'Норвегия (Mixkit: «Sunset drone flyover of rocky Norway sea coast»)', 'Sunset drone flyover of rocky Norway sea coast'),
  'mk_road':     mk(8661, 'горная дорога-серпантин', 'Ходдевик, Норвегия', 'Aerial view of mountain road in Hoddevik Norway'),
  'mk_opera':    mk(11042, 'оперный театр', 'Осло', 'The Oslo opera house in Norway'),
  'c_sommaroy':  c('Aerial_imagery_of_Sommarøy_and_surrounding_islands,_Norway.webm', 'острова и шхеры с дрона', 'Сомарёй, Тромс'),
  'c_fjords':    c('Aerial_imagery_of_fjords_and_rivers_in_Arctic_Norway.webm', 'фьорды и долины с дрона', 'Северная Норвегия'),
  'c_geiranger': c('Geirangerfjorden.webmhd.webm', 'фьорд с борта судна', 'Гейрангер-фьорд'),
  'c_lofoten':   c('LOFOTEN_ISLANDS_-_NORWAY_-_4K_FILM.webm', 'острова и рыбацкие посёлки', 'Лофотенские острова'),
  'c_midnight':  c('Midnight_rainbow_tromsø.ogv', 'полночь летом, солнце и радуга', 'Тромсё, 69° с. ш.'),
  'c_aurora_t':  c('Video_Auroras_Boreales_en_el_lago_helado_de_Prestvannet_Tromsø_Noruega_(Marzo_2014).webm', 'северное сияние над озером', 'озеро Престваннет, Тромсё'),
  'c_aurora':    c('Time-lapse_of_Aurora_Borealis_in_Norway.webm', 'северное сияние (таймлапс)', 'Норвегия'),
  'mk_aurora':   mk(4036, 'северное сияние', 'Норвегия (Mixkit: «Yellow northern lights in Norway»)', 'Yellow northern lights in Norway'),
  'c_isfjell':   c('Isfjelltunnelen.ogv', 'въезд в тоннель и поездка внутри', 'Исфьелльтуннелен, Кофьорд'),
  'c_skardal':   c('Skardalstunnelen.ogv', 'поездка по скальному тоннелю', 'Скардальстуннелен, Кофьорд'),
  'c_moskenes':  c('Moskenes_Hafen_lub_2025-07-23_Fähre_Bodo-Moskenes.webm', 'паром отходит от причала', 'гавань Москенес, Лофотены'),
  'c_vaeroy':    c('Fähre_Værøy-Røst-Bodø_lub_2025-07-24.webm', 'вид с палубы парома', 'паром Будё — Вэрёй — Рёст'),
  'c_basto':     c('Bastø_I.ogv', 'машины и фуры у носовой рампы парома', 'паром «Бастё I», Хортен'),
  'c_stavanger': c('STAVANGER_-_NORWAY_(4K).webm', 'старый город и гавань', 'Ставангер'),
  'c_oslo_pc':   c('POSTCARD_FROM_OSLO_-_NORWAY.webm', 'улицы и набережные', 'Осло'),
  'c_oslo_hov':  c('Oslo_fra_Hovedøya.webm', 'панорама города с острова', 'Осло, вид с Ховедёйи'),
  'c_tram':      c('Trikk_passerer_rådhuset_i_Oslo_20250314_121204.webm', 'трамвай у ратуши', 'Осло'),
  'c_svalbard':  c('Why_the_fastest_warming_place_on_earth_can’t_quit_coal.webm', 'город, шахты, снег', 'Лонгйир, Шпицберген'),
  'c_herskedal': c('Daniel_Herskedal_–_The_Hunting_Golden_Eagle_–_Nature_drone_cinematography_of_snowy_landscapes_in_Norway.webm', 'заснеженные горы с дрона', 'Норвегия'),
  # --- фото ---
  'p_lindesnes': c('Lindesnes_Fyr_Lighthouse_Våge,_Vest-Agder,_Southernmost_point_of_Norway_2023-06-25_Drone_photo_by_Martin_Schmitt_Flickr_Some_rights_reserved_54049482300_be516fe23f_o.jpg', 'маяк на южной оконечности', 'мыс Линдеснес'),
  'p_nordkapp':  c('NO-nordkap-plateau.jpg', 'плато Нордкап с моря', 'Нордкап, остров Магерёйа'),
  'p_laerdal1':  c('Lærdal_Lærdalstunnel_lub_2025-07-30_img01.jpg', 'внутри тоннеля', 'Лердальский тоннель'),
  'p_laerdal2':  c('Lærdal_Lærdalstunnel_lub_2025-07-30_img02.jpg', 'внутри тоннеля', 'Лердальский тоннель'),
  'p_bluecave':  c('Blue_cave_(9879393713).jpg', 'грот с голубой подсветкой', 'Лердальский тоннель'),
  'p_hall3':     c('Lærdalstunnelen_(3._hall).jpg', 'третий грот', 'Лердальский тоннель'),
  'p_ampere':    c('9683611_Ampere_2015.jpg', 'электропаром «Ампер»', 'Согне-фьорд'),
  'p_ampere2':   c('Ferry_Ampere_Sognefjord.jpg', 'электропаром «Ампер» у Лавика', 'Согне-фьорд'),
  'p_ekofisk':   c('Ekofisk_complex.jpg', 'платформы комплекса Экофиск', 'Северное море'),
  'p_oil':       c('Ekofisk_2-4_K_(DEX_KF_000635).jpg', 'платформы Экофиск 2/4 K и 2/4 B (архивное фото)', 'месторождение Экофиск, Северное море'),
  'p_salmon':    c('Jaulas_flotantes_de_salmón,_Svolvær,_Lofoten,_Noruega,_2019-09-05,_DD_53.jpg', 'садки лососевой фермы', 'Свольвер, Лофотены'),
  'p_nigard':    c('At_the_edge_of_the_glacier_Nigardsbreen,_Norway.jpg', 'край ледника', 'ледник Нигардсбреен'),
  'p_nigard2':   c('Nigardsbreen_2021.jpg', 'язык ледника в долине', 'ледник Нигардсбреен'),
  'p_ev_lot':    c('EV_parking_lot_Oslo_10_2018_3774.jpg', 'электромобили на зарядке', 'Осло'),
  'p_ev_pole':   c('Charging_pole_EV_parking_lot_Oslo_10_2018_3799.jpg', 'стоянка только для электромобилей', 'Осло'),
  'p_ev_fast':   c('Recharge_fast_charging_station_Rygge_Norway_2022.jpg', 'станция быстрой зарядки', 'Рюгге'),
  'p_cemetery':  c('Cemetery_in_Longyearbyen,_Svalbard,_July_2026.jpg', 'кладбище', 'Лонгйир, Шпицберген'),
  'p_cemetery2': c('Graveyard_of_Longyearbyen,_Svalbard,_below_coal_mine_no.1.jpg', 'кладбище под старой шахтой', 'Лонгйир, Шпицберген'),
  'p_lyb':       c('Longyearbyen,_Svalbard_-_aerial_view.jpg', 'город с высоты', 'Лонгйир, Шпицберген'),
}
MEDIA['p_salmon']['author'] = MEDIA['p_salmon']['author'] or 'Diego Delso (delso.photo)'

KB_IN = (1.0, 1.14, (0.5, 0.5), (0.5, 0.5))
BEAT2 = 0.929   # два удара трека Wind Leaves (~129 BPM): склейки вступления в такт

# Вступление без голоса: быстрая нарезка самых красивых мест + заголовок (как «коллаж» у референсов)
INTRO = [
  ('m1', dict(m='c_lofoten', ss=137)),
  ('m2', dict(m='c_sommaroy', ss=30, tr='zoom')),
  ('m3', dict(m='c_fjords', ss=199, tr='zoom')),
  ('m4', dict(m='c_aurora', ss=10, tr='flash', title=True)),
  ('m5', dict(m='c_moskenes', ss=30, tr='zoom', title=True)),
  ('m6', dict(m='c_stavanger', ss=36, tr='zoom', title=True)),
]
SHOTS = {
  # вступление
  'a1': dict(tr='whip', m='mk_coast', ss=0),
  'a2': dict(tr='zoom', map='europe_line'),
  'a3': dict(m='c_sommaroy', ss=137, loc='Сомарёй, Тромс'),
  'a4': dict(map='coast_total'),
  'a5': dict(m='c_geiranger', ss=6.5, loc='Гейрангер-фьорд'),
  'a6': dict(gfx='depth', tail=3.4),
  'a7': dict(tr='zoom', map='polar'),
  'a8': dict(m='c_midnight', ss=8, loc='Тромсё, полночь летом'),
  'a9': dict(tr='flash', m='p_ekofisk', kb=(1.0, 1.15, (0.45, 0.5), (0.55, 0.5)), loc='Экофиск, Северное море'),
  'a10': dict(m='p_ev_lot', kb=(1.05, 1.2, (0.5, 0.55), (0.45, 0.5)), loc='Осло'),
  'a11': dict(m='p_salmon', kb=(1.0, 1.3, (0.5, 0.6), (0.45, 0.66)), loc='лососевые садки, Свольвер'),
  'a12': dict(tr='flash', m='p_cemetery', kb=(1.0, 1.12, (0.5, 0.55), (0.5, 0.45)), loc='Лонгйир, Шпицберген', q=True),
  'a13': dict(m='mk_road', ss=0),
  # форма страны
  'b1': dict(tr='whip', map='norway_zoom'),
  'b2': dict(m='p_lindesnes', kb=(1.0, 1.12, (0.5, 0.5), (0.5, 0.45)), loc='мыс Линдеснес — юг'),
  'b3': dict(m='p_nordkapp', kb=(1.0, 1.08, (0.35, 0.5), (0.6, 0.5)), loc='Нордкап — север'),
  'b4': dict(tr='zoom', map='length'),
  'b5': dict(tr='fade', map='rotate'),
  # берег
  'c1': dict(tr='slide', map='coast_trace'),
  'c2': dict(map='coast_main'),
  'c3': dict(tr='zoom', m='c_lofoten', ss=50, txt='71 963 км', sub='берег 239 057 островов (Kartverket)'),
  'c4': dict(map='coast_total'),
  # фьорды
  'd1': dict(tr='whip', m='p_nigard', kb=(1.0, 1.12, (0.5, 0.5), (0.55, 0.45)), loc='ледник Нигардсбреен'),
  'd2': dict(m='p_nigard2', kb=(1.0, 1.15, (0.5, 0.4), (0.5, 0.6))),
  'd3': dict(m='c_fjords', ss=116),
  'd4': dict(m='c_geiranger', ss=11.5, loc='Гейрангер-фьорд'),
  'd5': dict(tr='zoom', map='sogne'),
  'd6': dict(tr='fade', gfx='depth'),
  'd7': dict(gfx='depth'),
  # тоннели
  'e1': dict(tr='slide', m='c_herskedal', ss=84),
  'e2': dict(m='c_isfjell', ss=0, loc='Исфьелльтуннелен, Тромс'),
  'e3': dict(m='c_skardal', ss=30, txt='> 1 200', sub='автомобильных тоннелей в Норвегии'),
  'e4': dict(tr='zoom', map='laerdal'),
  'e5': dict(m='p_laerdal1', kb=(1.0, 1.15, (0.5, 0.5), (0.5, 0.5)), loc='Лердальский тоннель'),
  'e6': dict(m='p_laerdal2', kb=(1.05, 1.2, (0.5, 0.5), (0.5, 0.5))),
  'e7': dict(m='p_bluecave', kb=(1.0, 1.15, (0.4, 0.5), (0.6, 0.5)), loc='грот в Лердальском тоннеле'),
  # паромы
  'k1': dict(tr='whip', m='c_moskenes', ss=0, loc='паромная гавань Москенес, Лофотены'),
  'k2': dict(m='c_basto', ss=150, loc='паром «Бастё I», Хортен'),
  'k3': dict(m='c_vaeroy', ss=8, loc='паром Будё — Вэрёй — Рёст'),
  'k4': dict(m='c_moskenes', ss=22),
  'k5': dict(m='c_vaeroy', ss=0),
  'k6': dict(m='p_ampere2', kb=(1.0, 1.12, (0.45, 0.5), (0.55, 0.5)), loc='«Ампер», Согне-фьорд'),
  'k7': dict(tr='zoom', map='ampere'),
  # нефть и фонд
  'f1': dict(tr='whip', m='c_lofoten', ss=84, loc='рыбацкие домики-рорбу, Лофотены'),
  'f2': dict(tr='zoom', map='ekofisk'),
  'f3': dict(m='p_oil', kb=(1.0, 1.15, (0.5, 0.45), (0.5, 0.55)), loc='Экофиск 2/4, архивное фото'),
  'f4': dict(m='c_stavanger', ss=181, loc='Ставангер — столица нефтяной отрасли'),
  'f5': dict(m='c_tram', ss=6, loc='ратуша Осло'),
  'f6': dict(tr='slide', m='c_oslo_pc', ss=47.0, slow=1.4, loc='Стортинг (парламент), Осло', txt='21 268 млрд крон', sub='стоимость фонда на 31.12.2025 (NBIM)'),
  'f7': dict(m='mk_opera', ss=2, txt='≈ 1,5 %', sub='акций всех биржевых компаний мира (NBIM)'),
  'f8': dict(m='c_oslo_pc', ss=136, loc='парк Вигеланда, Осло', txt='≈ 3,8 млн крон', sub='на каждого жителя: 21 268 млрд / 5,6 млн человек'),
  # электромобили
  'g1': dict(tr='flash', m='p_ev_fast', kb=(1.0, 1.1, (0.5, 0.5), (0.5, 0.5))),
  'g2': dict(m='p_ev_pole', kb=(1.0, 1.1, (0.5, 0.35), (0.5, 0.55)), loc='Осло: стоянка только для электромобилей'),
  'g3': dict(tr='slide', gfx='ev_chart'),
  'g4': dict(gfx='ev_chart'),
  # конец
  'h1': dict(tr='fade', map='polar2'),
  'h2': dict(m='c_aurora', ss=2),
  'h3': dict(m='p_lyb', kb=(1.0, 1.12, (0.5, 0.5), (0.55, 0.5)), loc='Лонгйир, Шпицберген'),
  'h4': dict(m='c_aurora', ss=26),
}
