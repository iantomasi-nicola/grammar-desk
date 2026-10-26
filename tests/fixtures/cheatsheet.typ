// Small two-column cheatsheet for tests/cheatsheet.test.js (same layout as the real one). Rebuild: python3 -c "import typst; typst.compile('cheatsheet.typ', output='cheatsheet.pdf')"
#set page(paper: "a4", margin: (x: 1.5cm, y: 2cm), columns: 2, header: text(size: 8pt, fill: gray)[English cheatsheet])
#set text(size: 9pt, font: "Libertinus Serif")
#set heading(numbering: "1.1")
#show heading.where(level: 1): set text(size: 13pt)
= Tempi verbali
== To be
Il verbo essere è irregolare.
#table(columns: 3, [Soggetto], [Afferm.], [Negativa], [I], [am], [am not], [You], [are], [are not])
== Present
#lorem(160)
#table(columns: 2, [Soggetto], [Verbo], [He / She / It], [works])
#lorem(520)
== Past
#lorem(120)
#counter(heading).update(2)
= Vocabulary
== Numeri
#table(columns: (7em, 1fr), stroke: none, ..range(1, 13).map(i => ([word#i], [parola#i])).flatten())
