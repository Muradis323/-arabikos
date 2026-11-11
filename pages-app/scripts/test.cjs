const {readdirSync}=require('node:fs');
const {spawnSync}=require('node:child_process');
for(const file of readdirSync('pages-app/tests').filter(f=>f.endsWith('.cjs')&&!['nawawi-browser.cjs','offline-worker.cjs'].includes(f)).sort()){
 const result=spawnSync(process.execPath,['pages-app/tests/'+file],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
