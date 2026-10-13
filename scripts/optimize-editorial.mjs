import sharp from 'sharp';
import fs from 'node:fs/promises';
const assets=JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
await fs.mkdir('public/images/editorial',{recursive:true});
for(const {name,path} of assets){
  await sharp(path).webp({quality:95,effort:6}).toFile(`public/images/editorial/${name}.webp`);
  console.log(name);
}
