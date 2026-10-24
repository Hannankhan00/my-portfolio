const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const assetsDir = path.join(__dirname, '..', 'public', 'assets');
  const input = path.join(assetsDir, 'Hannan.png');

  if (!fs.existsSync(input)) {
    console.error('Input file not found:', input);
    process.exit(1);
  }

  console.log('Generating optimized assets from Hannan.png...');

  // 1. WebP version for ProfileCard (720px wide, high-dpi retina)
  await sharp(input)
    .resize({ width: 720 })
    .webp({ quality: 88, effort: 6 })
    .toFile(path.join(assetsDir, 'hannankhan.webp'));

  // 2. High quality PNG fallback (720px wide)
  await sharp(input)
    .resize({ width: 720 })
    .png({ quality: 85, compressionLevel: 9, effort: 8 })
    .toFile(path.join(assetsDir, 'hannankhan.png'));

  // 3. Branded OpenGraph image (1200x630) for Google Knowledge Panel & Social Previews
  const width = 1200;
  const height = 630;

  const svgBackground = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="25%" cy="35%" r="85%">
          <stop offset="0%" stop-color="#23123d" />
          <stop offset="50%" stop-color="#0e081c" />
          <stop offset="100%" stop-color="#06040a" />
        </radialGradient>
        <radialGradient id="glow" cx="72%" cy="45%" r="45%">
          <stop offset="0%" stop-color="rgba(192, 132, 252, 0.4)" />
          <stop offset="60%" stop-color="rgba(192, 132, 252, 0.08)" />
          <stop offset="100%" stop-color="rgba(192, 132, 252, 0)" />
        </radialGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e9d5ff" />
          <stop offset="50%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#a855f7" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)" />
      <circle cx="850" cy="315" r="420" fill="url(#glow)" />
      
      <rect x="20" y="20" width="1160" height="590" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
      
      <text x="90" y="220" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="20" fill="#c084fc" letter-spacing="3">PORTFOLIO</text>
      <text x="90" y="300" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="64" fill="#ffffff" letter-spacing="-1.5">Hannan Khan</text>
      <text x="90" y="365" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="30" fill="url(#accentGrad)">Full Stack Developer</text>
      
      <text x="90" y="450" font-family="ui-monospace, monospace" font-size="20" fill="rgba(255,255,255,0.7)">Next.js • React • Node.js • TypeScript</text>
      <text x="90" y="500" font-family="ui-monospace, monospace" font-size="18" fill="rgba(192, 132, 252, 0.9)">hannankhan.dev</text>
    </svg>
  `);

  const portrait = await sharp(input)
    .resize({ height: 590, fit: 'inside' })
    .toBuffer();

  const portraitMeta = await sharp(portrait).metadata();
  const leftPos = Math.round(1120 - portraitMeta.width);
  const topPos = height - portraitMeta.height;

  await sharp(svgBackground)
    .composite([
      {
        input: portrait,
        top: topPos,
        left: leftPos,
      },
    ])
    .png({ quality: 90 })
    .toFile(path.join(assetsDir, 'og-hannankhan.png'));

  const webpStat = fs.statSync(path.join(assetsDir, 'hannankhan.webp'));
  const pngStat = fs.statSync(path.join(assetsDir, 'hannankhan.png'));
  const ogStat = fs.statSync(path.join(assetsDir, 'og-hannankhan.png'));

  console.log('Done! Generated:');
  console.log('- hannankhan.webp:', (webpStat.size / 1024).toFixed(1), 'KB');
  console.log('- hannankhan.png:', (pngStat.size / 1024).toFixed(1), 'KB');
  console.log('- og-hannankhan.png:', (ogStat.size / 1024).toFixed(1), 'KB');
}

main().catch(console.error);
