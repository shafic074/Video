export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return new Response('Please provide a video URL using ?url=', { status: 400 });
  }

  const modifiedRequest = new Request(videoUrl, {
    method: request.method,
    headers: {
      'Origin': 'https://reelplexi.com',
      'Referer': 'https://reelplexi.com/',
      'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
    },
  });

  const response = await fetch(modifiedRequest);

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
      'Content-Length': response.headers.get('Content-Length') || '',
      'Accept-Ranges': 'bytes',
    },
  });
}
