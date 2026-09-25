const genshinMapFrame = document.getElementById('genshinMapFrame');
const openMapFallback = document.getElementById('openMapFallback');

const mapBaseUrl = 'https://act.hoyolab.com/ys/app/interactive-map/index.html?bbs_presentation_style=no_header&lang=en-us#/map/2';

function openRegionMap(centerCoords) {
  const targetUrl = `${mapBaseUrl}?center=${centerCoords}&zoom=-2.00`;
  genshinMapFrame.src = targetUrl;
  openMapFallback.href = targetUrl;
  genshinMapFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });
}