"""Generate the phone-free public resume from the editable website content.
Requires reportlab. Run from any directory; preserves the original resume/ PDFs.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
profile = json.loads((ROOT / 'content/profile.json').read_text())
projects = json.loads((ROOT / 'content/projects.json').read_text())
INK=colors.HexColor('#18232b');MUTED=colors.HexColor('#536570');ACCENT=colors.HexColor('#285c79');LINE=colors.HexColor('#d5dde3')
style={
 'name':ParagraphStyle('name',fontName='Helvetica-Bold',fontSize=25,leading=29,textColor=INK,spaceAfter=5),
 'tagline':ParagraphStyle('tagline',fontName='Helvetica',fontSize=10,leading=14,textColor=ACCENT,spaceAfter=7),
 'contact':ParagraphStyle('contact',fontName='Helvetica',fontSize=8.5,leading=13,textColor=MUTED,spaceAfter=10),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=9,leading=12.5,textColor=INK,spaceAfter=6),
 'bullet':ParagraphStyle('bullet',fontName='Helvetica',fontSize=8.8,leading=12.4,textColor=INK,leftIndent=10,firstLineIndent=-8,spaceAfter=4),
 'section':ParagraphStyle('section',fontName='Helvetica-Bold',fontSize=11,leading=15,textColor=ACCENT,spaceBefore=10,spaceAfter=6),
 'role':ParagraphStyle('role',fontName='Helvetica-Bold',fontSize=10.2,leading=14,textColor=INK,spaceAfter=2),
 'meta':ParagraphStyle('meta',fontName='Helvetica',fontSize=8.5,leading=12,textColor=MUTED,spaceAfter=5),
}
def para(text,kind='body'):return Paragraph(text,style[kind])
def text(value):return escape(value).replace('–','-').replace('—','-').replace('’',"'")
def month(value):
 import datetime
 return datetime.datetime.strptime(value,'%Y-%m').strftime('%b %Y')
def footer(canvas,doc):
 canvas.setStrokeColor(LINE);canvas.line(45,39,567,39);canvas.setFillColor(MUTED);canvas.setFont('Helvetica',8);canvas.drawString(45,26,'Manish Botta | botta.in');canvas.drawRightString(567,26,str(doc.page))
out=ROOT/'public/resume.pdf'
doc=SimpleDocTemplate(str(out),pagesize=letter,rightMargin=45,leftMargin=45,topMargin=39,bottomMargin=50,title='Manish Botta - Engineering Resume',author='Manish Botta',subject='Software engineering, AI systems, and forward-deployed delivery')
flow=[para(text(profile['name']),'name'),para('Software Engineering / Applied AI / Forward-Deployed Delivery','tagline'),para(f'{text(profile["location"])} | <link href="mailto:{profile["email"]}" color="#285c79">{profile["email"]}</link><br/><link href="https://botta.in" color="#285c79">botta.in</link> | <link href="{profile["github"]}" color="#285c79">github.com/Manishrdy</link> | <link href="{profile["linkedin"]}" color="#285c79">linkedin.com/in/manish-reddyb</link>','contact'),para('Software engineer building backend and applied AI systems, from enterprise integrations and retrieval agents to a solo-built B2B SaaS platform. Owns discovery, implementation, deployment, and production operations.'),para('Experience','section')]
selected={'tradeliv':[0,1,2],'microsoft':[0,2,3,4],'yellow-ai':[0,2,3],'cognizant':[0]}
for e in profile['experience']:
 period=f'{month(e["startDate"])} - {month(e["endDate"]) if e["endDate"] else "Present"}'
 block=[para(text(e['company']),'role'),para(f'{text(e["role"])} | {period}','meta')]
 for i in selected[e['id']]:block.append(para('- '+text(e['bullets'][i]),'bullet'))
 block.append(Spacer(1,6));flow.append(KeepTogether(block))
flow.extend([PageBreak(),para('Selected projects & technical depth','name'),para('Manish Botta / General engineering resume','tagline'),para('Selected projects','section')])
for slug in ['coldstart','role-collector','simcricketx','async-audio-pipeline']:
 p=next(p for p in projects if p['slug']==slug)
 block=[para(text(p['title']),'role'),para(f'<link href="{p["repoUrl"]}" color="#285c79">{text(p["repoUrl"].replace("https://",""))}</link>','meta'),para(text(p['description'])),para('- '+text(p['outcome']),'bullet'),para('<b>Stack:</b> '+text(', '.join(p['tags'][:7])),'meta'),Spacer(1,7)]
 flow.append(KeepTogether(block))
flow.append(para('Technical skills','section'))
for g in profile['skillGroups']:flow.append(para('<b>'+text(g['title'])+':</b> '+text(', '.join(g['items']))))
flow.append(para('Education','section'))
for e in profile['education']:
 flow.append(KeepTogether([para(text(f'{e["qualification"]} {e["field"]}'),'role'),para(text(e['institution'])+f' | {month(e["start_date"])} - {month(e["end_date"])}','meta')]))
doc.build(flow,onFirstPage=footer,onLaterPages=footer)
print(f'Generated {out}')
