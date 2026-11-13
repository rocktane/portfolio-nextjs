"""Build two self-contained portfolio prototypes; no production app imports."""
from pathlib import Path
import base64, json
from html import escape
ROOT=Path(__file__).resolve().parent
PROJECTS=[
 dict(id='brower',name='Brower',tag='Vos apps Mac. Une commande.',kind='Web',state='Bêta',stack=['Vue.js','TypeScript','Node.js'],url='https://bro.yohan.one',role='Conception et développement',description='Un catalogue Homebrew : sélectionnez vos applications et récupérez une commande d’installation.',lab=False),
 dict(id='exo',name='Exo',tag='Un défi de code par jour.',kind='Web',state='En ligne',stack=['Next.js','TypeScript','InstantDB'],url='https://exo.yohan.one',role='Conception et développement',description='Wordle, terminal, regex et chasse aux bugs : des défis quotidiens pour les développeurs.',lab=False),
 dict(id='safee',name='Safee',tag='La sécurité des travailleurs isolés.',kind='Mobile',state='En ligne',stack=['React Native','NestJS','AWS'],url='https://safee.fr',role='Développeur fullstack',description='Application mobile, bouton d’alarme et supervision des collaborateurs sur le terrain.',lab=False),
 dict(id='tvcal',name='tvcal',tag='Vos séries dans votre agenda.',kind='Web',state='En ligne',stack=['Next.js','TypeScript','SQLite'],url='https://tvcal.yohan.one',role='Conception et développement',description='Un flux de calendrier ICS pour suivre les diffusions de ses séries, sans compte.',lab=False),
 dict(id='cashou',name='Cashou',tag='La finance, en jouant.',kind='Mobile',state='En cours',stack=['Expo','tRPC','Prisma'],url='https://cashou.app',role='Développement fullstack · Epitech',description='Un jeu sérieux pour apprendre la finance à travers des décisions d’investissement.',lab=False),
 dict(id='amp',name='Amp',tag='Sonos, natif sur macOS.',kind='macOS',state='En cours',stack=['SwiftUI','Swift','SonosKit'],url='https://github.com/rocktane/Amp',role='Conception et développement',description='Un contrôleur Sonos en SwiftUI. La logique réseau vit dans un package indépendant, SonosKit.',lab=True),
 dict(id='tamanotchi',name='Tamanotchi',tag='Un compagnon dans votre encoche.',kind='macOS',state='En cours',stack=['SwiftUI','Swift'],url='https://github.com/rocktane/tama',role='Conception et développement',description='Un tamagotchi installé dans l’encoche du Mac, avec accessoires à débloquer.',lab=True),
 dict(id='betterbattery',name='BetterBattery',tag='Votre batterie vous dira merci.',kind='macOS',state='En ligne',stack=['Swift','SMC','Apple Silicon'],url='https://github.com/rocktane/betterbattery',role='Conception et développement',description='Une app de barre de menus pour limiter la charge et préserver la batterie de son Mac.',lab=True),
]
for p in PROJECTS:
 data=(ROOT.parent/'public/projects'/(p['id']+'.webp')).read_bytes()
 p['image']='data:image/webp;base64,'+base64.b64encode(data).decode()
fonts=(ROOT/'fonts.css').read_text()
css=(ROOT/'styles.css').read_text()
js=(ROOT/'app.js').read_text()
markup=(ROOT/'template.html').read_text()

def card(p):
    badge='<span class="play-note">Bêta</span>' if p['id']=='brower' else ('<span class="card-spark" aria-hidden="true">✳</span>' if p['id']=='exo' else '')
    return f'''<article class="can-card"><button class="project-image" data-project="{p['id']}" aria-label="Agrandir l’aperçu de {p['name']}"><img data-image="{p['id']}" alt="Capture d’écran de {p['name']}" width="1440" height="900" loading="{'eager' if p['id'] in ['brower','exo'] else 'lazy'}"></button><div class="can-card-info"><div><h3><a href="{p['url']}" target="_blank" rel="noopener noreferrer">{p['name']} <span aria-hidden="true">↗</span></a>{badge}</h3><p>{p['tag']}</p></div><span class="can-state">{p['kind']}</span></div></article>'''
markup=markup.replace('<!-- CAN_CARDS -->',''.join(card(p) for p in PROJECTS[:6]))
head='''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#103e3d"><title>Canopée & Atelier — Yohan Gouiran</title><style>'''+fonts+css+'</style></head>'
for name,initial in [('index','canopee'),('canopee','canopee'),('atelier','atelier')]:
    (ROOT/(name+'.html')).write_text(head+'<body data-initial="'+initial+'" data-theme="canopee">'+markup+'<script>const PROJECTS='+json.dumps(PROJECTS,ensure_ascii=False).replace('</','<\\/')+';</script><script>'+js+'</script></body></html>')
print('Built index.html, canopee.html, atelier.html (original screenshots, embedded fonts).')
