import asyncio, urllib.parse as U
from playwright.async_api import async_playwright
B='http://localhost:8765/'
def url(**k): return B+'frame.html?'+U.urlencode(k)
SHOTS=[
 dict(name='1-viewer', src='build-viewer/index.html?m=v', pt='Payments API reference', t='Interactive API docs on any page', s='Paste YAML or JSON, use an attachment, or link a GitHub file. SpecPort renders full Swagger UI with schemas, examples and Try it out.', act='viewer'),
 dict(name='2-importer', src='build-importer/index.html', pt='Space settings', cr='Engineering / Space settings', t='Migrate old Swagger macros in one click', s='Scan a space for OpenAPI and Swagger macros from retiring apps and convert them to SpecPort. Every page keeps a version for rollback.', act='importer'),
 dict(name='3-config', src='build-config/index.html?m=cfg', k='modal', t='Check your spec before you publish', s='Validate OpenAPI 3 and Swagger 2 as you edit. Built on Forge: runs on Atlassian, with no outside servers and no personal data stored.', act='config'),
]
async def act(page, a):
  f = page.frame_locator('#f')
  if a=='viewer':
    await f.locator('.opblock-summary-path', has_text='/charges').first.wait_for(timeout=20000)
    await page.wait_for_timeout(1000)
  if a=='importer':
    await f.get_by_text('Scan this space').click(); await page.wait_for_timeout(500)
    for i in range(2): await f.get_by_text('Convert').first.click(); await page.wait_for_timeout(300)
  if a=='config':
    await f.get_by_text('Check spec').click(); await page.wait_for_timeout(600)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium')
    for s in SHOTS:
      for (w,h,cw,hs,ps,suffix,scale) in [(1840,900,620,56,25,'1840x900',1),(1120,548,0,0,0,'',0)]:
        if not w==1840: continue
        pg=await b.new_page(viewport={'width':w,'height':h})
        await pg.goto(url(w=w,h=h,cw=cw,hs=hs,ps=ps,src=s['src'],k=s.get('k',''),pt=s.get('pt',''),cr=s.get('cr','Engineering / API'),t=s['t'],s=s['s']))
        await pg.wait_for_timeout(1500); await act(pg,s['act'])
        await pg.screenshot(path=f"out/{s['name']}-{suffix}.png"); await pg.close()
    # cropped 580x330: render the app window only at 1160x660 then downscale
    for s in SHOTS:
      pg=await b.new_page(viewport={'width':1160,'height':660})
      await pg.goto(url(w=1160,h=660,cw=1,hs=1,ps=1,src=s['src'],k=s.get('k',''),pt=s.get('pt',''),cr=s.get('cr','Engineering / API'),t='',s=''))
      await pg.add_style_tag(content='.copy{display:none}.win{margin:28px!important;height:604px!important}')
      await pg.wait_for_timeout(1500); await act(pg,s['act'])
      await pg.screenshot(path=f"out/{s['name']}-crop-raw.png"); await pg.close()
    # banner
    pg=await b.new_page(viewport={'width':1120,'height':548})
    await pg.goto(url(w=1120,h=548,cw=470,hs=40,ps=19,src='build-viewer/index.html?m=v',pt='Payments API reference',t='SpecPort: OpenAPI & Swagger Docs',s='Interactive API docs in Confluence, plus one-click migration from retiring Swagger apps. By Pratik Poddar.'))
    await pg.add_style_tag(content='.copy{padding:0 32px 0 48px}.copy img{width:60px;margin-bottom:20px}.win{margin-right:40px;height:476px!important}.page{padding:14px 20px}.title{font-size:20px}')
    await pg.wait_for_timeout(1500); await act(pg,'viewer')
    await pg.frames[1].evaluate("document.querySelector('.opblock-tag-section').scrollIntoView()"); await pg.wait_for_timeout(400)
    await pg.screenshot(path='out/banner-1120x548.png'); await b.close()
asyncio.run(main())
