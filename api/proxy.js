export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return new Response('Please provide a video URL using ?url=', { status: 400 });
  }

  const headers = new Headers();
  headers.set('Origin', 'https://reelplexi.com');
  headers.set('Referer', 'https://reelplexi.com/');
  headers.set('User-Agent', request.headers.get('User-Agent') || 'Mozilla/5.0');

  // 🔥 CRITICAL FIX: Pass the Range header to allow streaming/seeking
  const range = request.headers.get('Range');
  if (range) {
    headers.set('Range', range);
  }

  const modifiedRequest = new Request(videoUrl, {
    method: 'GET',
    headers: headers,
  });

  const response = await fetch(modifiedRequest);

  const responseHeaders = new Headers();
  responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
  responseHeaders.set('Accept-Ranges', 'bytes');
  
  // Allow the video to play in any webview/browser
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  
  const contentLength = response.headers.get('Content-Length');
  if (contentLength) responseHeaders.set('Content-Length', contentLength);
  
  const contentRange = response.headers.get('Content-Range');
  if (contentRange) responseHeaders.set('Content-Range', contentRange);

  // Return the chunk of video
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
