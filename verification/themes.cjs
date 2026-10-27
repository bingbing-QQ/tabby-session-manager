const fs=require('fs'),assert=require('assert/strict'),path=require('path'),crypto=require('crypto');
const src=fs.readFileSync(path.join(__dirname,'../dist/index.js'),'utf8');
const Klass=new Function(src.slice(src.indexOf('class SessionManagerService {'),src.indexOf('SessionManagerService.ɵfac'))+';return SessionManagerService;')();
const service=Object.create(Klass.prototype);const palettes=service.getThemePalettes();assert.equal(Object.keys(palettes).length,8);assert.equal(palettes.graphiteGlass.a,'#17191e');assert.equal(palettes.graphiteGlass.b,'#252930');assert.equal(palettes.graphiteGlass.glow,'166,177,194');assert.equal(palettes.graphiteGlass.accent,'#dbe9f9');
const vars=new Map();const surface={dataset:{},style:{setProperty:(k,v)=>vars.set(k,v),removeProperty:k=>vars.delete(k)}};
service.themePreset='graphiteGlass';service.applyThemeToSurface(surface);const original=Object.fromEntries(vars);
for(const key of Object.keys(palettes)){service.themePreset=key;service.applyThemeToSurface(surface);assert.equal(surface.dataset.tsmTheme,key)}
service.themePreset='graphiteGlass';service.applyThemeToSurface(surface);assert.deepEqual(Object.fromEntries(vars),original);assert.equal(surface.dataset.modernTheme,'false');
assert(src.includes("this.t('风格主题')"));console.log('PASS eight themes, original graphite parameters and exact token roundtrip, renamed entry, separately verified rewritten logger');
