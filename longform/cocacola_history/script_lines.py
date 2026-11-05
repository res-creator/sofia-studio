# Source of truth for the spoken lines (American English). Writes chapters/<ch>/script.json. Edit here, then run: python3 script_lines.py
import json, os
CH = {
'c0_hook': [
 ('h1', "Right now, somewhere on Earth, someone is opening a Coca-Cola. And someone else. And someone else. Every single day, people drink about two point two billion servings of the company's drinks."),
 ('h2', "It started in 1886 with a man selling about nine glasses a day... in a pharmacy."),
 ('h3', "Along the way, its owners sold one of the most valuable ideas in the company's history for one dollar, changed the recipe and got yelled at by an entire country, and shipped whole bottling plants to a world war."),
 ('h4', "So how did a drink that sold nine glasses a day take over the planet? It starts with a wounded soldier and a jug of syrup."),
],
'c1_pemberton': [
 ('p1', "John Pemberton was a pharmacist in Georgia. In the Civil War, he was badly wounded by a saber, and like many veterans of his time, he ended up fighting an addiction to morphine."),
 ('p2', "So he did what pharmacists did in the 1880s. He mixed tonics and sold them as cures. His best seller was a coca wine: wine mixed with an extract of the coca leaf."),
 ('p3', "Then, in 1886, Atlanta went dry. Overnight, his best seller had a problem."),
 ('p4', "Pemberton went back to his kettle. He dropped the wine, kept the coca leaf, added kola nut... and a lot of sugar. The result was a syrup."),
 ('p5', "On May 8th, 1886, he carried a jug of it down the street to Jacobs' Pharmacy. There, it was mixed with carbonated water and sold at the soda fountain. Five cents a glass."),
 ('p6', "His bookkeeper, Frank Robinson, came up with the name, Coca-Cola, after two of its ingredients. He also wrote it out in the flowing script the brand still uses today."),
 ('p7', "In the first year, sales averaged about nine drinks a day. By most accounts, Pemberton spent more on advertising than the drink earned."),
 ('p8', "And he was running out of time. Sick and short on money, he sold off pieces of the business to different partners. In 1888, John Pemberton died. He never saw what his syrup would become."),
],
'c2_candler': [
 ('a1', "One of those buyers was an Atlanta businessman named Asa Candler. By 1891, he controlled the whole thing. The total price, by the usual count: about two thousand three hundred dollars."),
 ('a2', "Candler wasn't a chemist. He was a salesman. And he understood something simple: nobody buys a drink they've never tasted."),
 ('a3', "So he gave it away. The company handed out and mailed tickets for a free glass. By its own later estimate, between 1894 and 1913, about one in nine Americans got a free Coca-Cola this way."),
 ('a4', "Then he made sure you couldn't forget the name. It went on clocks, calendars, serving trays, paper fans... anything that would hang on a wall or sit on a counter."),
 ('a5', "By 1895, Coca-Cola was sold in every state. And in the early 1900s, the cocaine was taken out of the coca leaf extract."),
 ('a6', "Candler had built a hit at the soda fountain. Now he was about to make one of the strangest deals in business history."),
],
'c3_bottles': [
 ('b1', "In 1899, two lawyers from Chattanooga, Tennessee, came to see him. Benjamin Thomas and Joseph Whitehead had an idea: put Coca-Cola in bottles."),
 ('b2', "Candler wasn't impressed. Bottling was messy, and his drink was made for the soda fountain. But if they wanted to take the risk... fine."),
 ('b3', "He sold them the rights to bottle Coca-Cola across most of the United States. For one dollar. And, reportedly, he never even collected it."),
 ('b4', "That dollar built the empire. Thomas and Whitehead didn't build every plant themselves. They signed up local businessmen who paid for their own bottling plants, their own trucks and their own salesmen."),
 ('b5', "Town after town got its own Coca-Cola bottler, with its own money on the line. The company sold the syrup. The bottlers did the rest."),
 ('b6', "But success attracts copycats. Soon there were drinks with almost the same name, in almost the same bottle."),
 ('b7', "So in 1915, the bottlers asked glass makers for a bottle you could recognize in the dark... or even broken on the ground. A glass company in Terre Haute, Indiana, came back with a curvy design. The contour bottle."),
],
'c4_woodruff': [
 ('w1', "In 1919, Candler's family sold the company to a group of investors led by banker Ernest Woodruff. The price: twenty-five million dollars."),
 ('w2', "A few years later, his son Robert took over, and he ran Coca-Cola for decades. His goal was easy to say and hard to do: put a Coke within an arm's reach of desire."),
 ('w3', "That meant cartons that carried six bottles home. Coolers at gas stations. Vending machines. And ads everywhere, including the Christmas paintings of Santa Claus that started in 1931."),
 ('w4', "And no, Coca-Cola didn't invent the red Santa. He was wearing red long before that. But those ads made a warm, jolly Santa the one most people picture."),
 ('w5', "Then came World War Two. In 1941, Woodruff made a promise: every man in uniform would get a bottle of Coke for five cents, wherever he was... and whatever it cost the company."),
 ('w6', "To keep that promise, Coca-Cola shipped bottling equipment overseas. During the war, sixty-four bottling plants were set up, as close to the fighting as possible."),
 ('w7', "Millions of soldiers came home loving the drink. And the company came out of the war with a head start in dozens of countries. Coca-Cola went global by following the army."),
],
'c5_pepsi': [
 ('r1', "Meanwhile, a rival was growing. Pepsi-Cola was born in North Carolina in 1898, and it went bankrupt more than once."),
 ('r2', "In those hard years, Coca-Cola reportedly had chances to buy Pepsi. It passed every time."),
 ('r3', "Pepsi fought back with price. During the Great Depression, it sold a twelve-ounce bottle for a nickel. The same price as Coke's six-and-a-half-ounce bottle."),
 ('r3b', "Coke answered with feelings. In 1971, it filmed young people from around the world on a hilltop in Italy, singing about buying the world a Coke. A version of that song became a hit on the radio."),
 ('r4', "Pepsi answered with taste. In the Pepsi Challenge, which started in 1975, people took a sip from two unmarked cups... and on camera, a lot of them picked Pepsi."),
 ('r5', "Coke was still bigger, but it was losing ground. And inside the company, someone asked a dangerous question: what if we change the taste?"),
],
'c6_newcoke': [
 ('n1', "Coca-Cola tested a new, sweeter formula on nearly two hundred thousand consumers. In blind tests, it beat the old Coke. It even beat Pepsi."),
 ('n2', "On April 23rd, 1985, the company announced it was replacing its ninety-nine-year-old recipe."),
 ('n3', "America did not take it well. People stocked up on the old Coke. Protest groups formed. By June, the company's hotline was getting about fifteen hundred calls a day."),
 ('n4', "The taste tests had asked the wrong question. People weren't just drinking a flavor. They were drinking something they grew up with. Change it, and it felt like the company had taken something that belonged to them."),
 ('n5', "On July 11th, after seventy-nine days, the original came back as Coca-Cola Classic. In the two days after that announcement, the company got more than thirty-one thousand calls."),
 ('n6', "New Coke is remembered as one of the biggest marketing mistakes ever. But it showed the company something no taste test could: how much people cared."),
],
'c7_today': [
 ('t1', "Today, the Coca-Cola system sells more than thirty-three billion cases of drinks a year, in over two hundred countries and territories. In 2024, the company's revenue was about forty-seven billion dollars."),
 ('t2', "And it still works a lot like Candler's deal. The company mostly makes the concentrate and builds the brand. Independent bottling partners turn it into drinks and get them to stores."),
 ('t3', "Look back at the whole story, and the recipe was never the whole secret. Free samples got people to try it. A one-dollar deal put it in every town. A bottle made it hard to fake. A war carried it around the world. And when the company tried to change it, its own customers wouldn't let it."),
 ('t4', "John Pemberton sold about nine glasses a day. He thought he'd made a medicine. What he actually started was a habit... repeated two point two billion times a day."),
],
}
D = os.path.dirname(os.path.abspath(__file__))
n = 0
for ch, lines in CH.items():
    os.makedirs(f'{D}/chapters/{ch}', exist_ok=True)
    json.dump([{'id': i, 'text': t} for i, t in lines], open(f'{D}/chapters/{ch}/script.json', 'w'), indent=1)
    w = sum(len(t.split()) for _, t in lines); n += w; print(ch, len(lines), 'lines', w, 'words', sum(len(t) for _, t in lines), 'chars')
print('total words', n)
