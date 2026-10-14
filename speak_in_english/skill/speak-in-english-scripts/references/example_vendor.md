# Пример: «Тебе суют браслет — как отказать?» (2:08, одобрен владелицей)

Растущий артефакт: вещи на героине (браслеты → роза → наклейка и голубь → попугай → карта таро) + счётчик «ПОТРАЧЕНО £N». На C2 счётчик становится зелёным «ЗАРАБОТАНО +£15».

| id | кто | текст |
|---|---|---|
| hook | диктор | Тебе суют браслет «бесплатно». Как отказать по-английски? На Си-два она сама начнёт торговать. Проверим! |
| a1_x | RICO (браслеты) | Free! For you, free! |
| a1_x2 | RICO | ...Ten pounds. |
| a1_her | героиня | No! No money! No! |
| a1_x3 | RICO (достаёт терминал) | No money? No problem. Card? |
| a1_nar | диктор | Уровень А-один. Денег нет? Зато есть терминал. |
| a2_x | ROSA (бабушка с розами) | A rose for you, darling? |
| a2_her | героиня | I don't need nothing! |
| a2_x2 | ROSA | Don't need nothing? So you need something! A rose! |
| a2_nar | диктор | А-два. Два «не» — это «да». Значит, ей что-то нужно. Правильно так: |
| a2_tip | фраза | I don't need anything. |
| b1_x | KEVIN (активист) | Hi! Got a minute for the pigeons? |
| b1_her | героиня | No, thank you. I'm just looking. |
| b1_x2 | KEVIN | Looking? Great! Look at this. Save the pigeons! |
| b1_nar | диктор | Би-один. I'm just looking, «я просто смотрю». Теперь смотрит на голубя на голове. |
| b2_x | MARCO (фото с попугаем) | Photo with the parrot? Very nice! |
| b2_her | героиня | Thanks, but I'll pass. |
| b2_x2 | MARCO | Pass? Perfect! Pass me your phone! |
| b2_p | PARROT | Ten pounds! Ten pounds! |
| b2_nar | диктор | Би-два. I'll pass, «я пас». Но попугай уже выставил счёт. Запоминай: |
| b2_tip | фраза | Thanks, but I'll pass. |
| c1_x | MADAME ZORA (гадалка) | Your future, darling? Give me your hand. |
| c1_her | героиня | That's very kind of you, but I'm not interested, thank you. |
| c1_x2 | ZORA (показывает карту «NO») | I know. I saw it in the cards. That's five pounds. |
| c1_nar | диктор | Си-один. I'm not interested, «мне неинтересно». Красиво. Но гадалка знала заранее. Запоминай: |
| c1_tip | фраза | That's kind of you, but I'm not interested. |
| c2_x | BIG TONY (босс уличных продавцов) | You want more? |
| c2_her | героиня | I must respectfully decline your most generous solicitation. I find myself wholly disinclined to acquire any further trinkets. |
| (пауза, «...») | | |
| c2_t | TOURIST (старик) | Excuse me. How much is the parrot? |
| c2_her2 | героиня | ...Fifteen. Cash only. |
| c2_x2 | BIG TONY | Welcome to the team. |
| c2_nar | диктор | Си-два. Её приняли в команду. Не можешь отказать — продай сама! |
| outro | диктор | А как отказываешь ты? Пиши свою фразу в комментарии! И подпишись, впереди ещё много новых серий. |

Почему работает:
- каждый продавец разворачивает её фразу против неё (no money → card; nothing → something; looking → look at this; pass → pass me your phone; not interested → I saw it in the cards);
- каждый уровень — новый тип шутки: терминал, грамматика, голубь, говорящий попугай + «ба-дум-тсс», гадалка;
- C2: она сама становится продавцом — картинка, а не просто умная фраза.

Кнопка: «ОТПРАВЬ ТОМУ, КТО НЕ УМЕЕТ ОТКАЗЫВАТЬ».
