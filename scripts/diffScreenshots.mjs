import fs from 'fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const aPath = fs.existsSync('test-results/exposure-mobile-baseline.png') ? 'test-results/exposure-mobile-baseline.png' : 'test-results/exposure-mobile.png'
const bPath = 'test-results/exposure-mobile-variant.png'
const outPath = 'test-results/exposure-diff.png'

if (!fs.existsSync(aPath) || !fs.existsSync(bPath)) {
  console.error('One or both screenshot files are missing:', aPath, bPath)
  process.exit(2)
}

const aBuf = fs.readFileSync(aPath)
const bBuf = fs.readFileSync(bPath)
const imgA = PNG.sync.read(aBuf)
const imgB = PNG.sync.read(bBuf)

if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
  console.error('Screenshot sizes differ:', imgA.width, imgA.height, imgB.width, imgB.height)
  process.exit(3)
}

const { width, height } = imgA
const diff = new PNG({ width, height })

const diffPixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.1 })
fs.writeFileSync(outPath, PNG.sync.write(diff))
console.log('Wrote diff to', outPath, 'diffPixels=', diffPixels)
