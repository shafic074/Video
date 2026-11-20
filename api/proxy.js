export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');
  const movieName = searchParams.get('name') || 'Video'; // Gets the movie name

  if (!videoUrl) {
    return new Response('Please provide a video URL using ?url=', { status: 400 });
  }

  const headers = new Headers();
  headers.set('Origin', 'https://reelplexi.com');
  headers.set('Referer', 'https://reelplexi.com/');
  headers.set('User-Agent', request.headers.get('User-Agent') || 'Mozilla/5.0');

  const range = request.headers.get('Range');
  if (range) {
    headers.set('Range', range);
  }

  const modifiedRequest = new Request(videoUrl, { method: 'GET', headers: headers });
  const response = await fetch(modifiedRequest);

  const responseHeaders = new Headers();
  responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
  responseHeaders.set('Accept-Ranges', 'bytes');
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  
  // 🔥 THIS MAKES THE DOWNLOAD NAME MATCH THE MOVIE NAME
  const safeName = encodeURIComponent(movieName).replace(/%20/g, '_');
  responseHeaders.set('Content-Disposition', `inline; filename="${safeName}.mp4"`);
  
  const contentLength = response.headers.get('Content-Length');
  if (contentLength) responseHeaders.set('Content-Length', contentLength);
  
  const contentRange = response.headers.get('Content-Range');
  if (contentRange) responseHeaders.set('Content-Range', contentRange);

  return new Response(response.body, { status: response.status, headers: responseHeaders });
}
