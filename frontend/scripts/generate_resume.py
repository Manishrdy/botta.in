"""Generate the comprehensive, phone-free master resume from editable JSON.
Requires ReportLab. Does not modify original source resumes.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
ROOT=Path(__file__).resolve().parents[1]
profile=json.loads((ROOT/'content/profile.json').read_text())
master=json.loads((ROOT/'content/master-resume.json').read_text())
projects=json.loads((ROOT/'content/projects.json').read_text())
ink=colors.HexColor('#18232b');muted=colors.HexColor('#536570');accent=colors.HexColor('#285c79')
styles={k:ParagraphStyle(k,fontName=font,fontSize=size,leading=leading,textColor=color,spaceAfter=after) for k,font,size,leading,color,after in [
 ('name','Helvetica-Bold',25,29,ink,8),('title','Helvetica-Bold',19,24,ink,8),('section','Helvetica-Bold',11,15,accent,8),('body','Helvetica',10,14,ink,9),('meta','Helvetica',8.5,12,muted,9),('bullet','Helvetica',9.8,14,ink,8)]}
styles['bullet'].leftIndent=10;styles['bullet'].firstLineIndent=-8
for k in ['title','section']:styles[k].keepWithNext=True

def clean(x):return escape(x).replace('–','-').replace('—','-').replace('’',"'").replace('→',' to ')
def p(x,kind='body'):return Paragraph(clean(x),styles[kind])
def month(x):return datetime.strptime(x,'%Y-%m').strftime('%b %Y')
def footer(c,doc):
 c.setStrokeColor(colors.HexColor('#d5dde3'));c.line(44,37,568,37);c.setFillColor(muted);c.setFont('Helvetica',8);c.drawString(44,24,f'{profile["name"]} | Master Engineering Resume | botta.in');c.drawRightString(568,24,str(doc.page))
def contact():
 return Paragraph(f'{clean(profile["location"])} | <link href="mailto:{profile["email"]}">{clean(profile["email"])}</link><br/><link href="https://botta.in">botta.in</link> | <link href="{profile["github"]}">{clean(profile["github"].replace("https://",""))}</link> | <link href="{profile["linkedin"]}">{clean(profile["linkedin"].replace("https://",""))}</link>',styles['meta'])
flow=[p(profile['name'],'name'),p('Software Engineering / AI Engineering / Forward-Deployed Engineering / Forward-Deployed AI','section'),contact(),p(master['summary']),Spacer(1,8)]
# Each substantial role starts on a fresh page; content may flow further as it grows.
for i,detail in enumerate(master['experience']):
 job=next(e for e in profile['experience'] if e['id']==detail['id'])
 if i:flow.append(PageBreak())
 flow += [p(job['company'],'title'),p(job['role'],'section'),p(f'{month(job["startDate"])} - {month(job["endDate"]) if job["endDate"] else "Present"}','meta'),p(detail['scope'],'meta')]
 for bullet in detail['bullets']:flow.append(p('- '+bullet,'bullet'))
 if detail['prototype']:flow.extend([p('Earlier retrieval prototype - not current production','section'),p(detail['prototype'],'bullet')])
 flow += [p('Technologies: '+', '.join(detail['skills']),'meta')]
# Compact supporting evidence follows the final (early-career) role.
flow += [Spacer(1,8),p('Selected projects','section')]
for slug in master['projectSlugs']:
 project=next(x for x in projects if x['slug']==slug)
 flow.append(KeepTogether([Paragraph(f'<b>{clean(project["title"])}</b> - <link href="{project["repoUrl"]}">{clean(project["repoUrl"].replace("https://",""))}</link>',styles['meta']),p(project['outcome'],'bullet')]))
flow += [Spacer(1,6),p('Education','section')]
for e in profile['education']:flow.append(p(f'{e["qualification"]} {e["field"]} - {e["institution"]} | {month(e["start_date"])} - {month(e["end_date"])}','meta'))
output=ROOT/'public/resume.pdf'
SimpleDocTemplate(str(output),pagesize=letter,leftMargin=44,rightMargin=44,topMargin=40,bottomMargin=50,title=f'{profile["name"]} - Master Engineering Resume',author=profile['name'],subject='Software engineering, AI engineering, forward-deployed engineering and forward-deployed AI').build(flow,onFirstPage=footer,onLaterPages=footer)
print(f'Generated {output}')
