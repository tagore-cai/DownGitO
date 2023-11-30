// route /gh-auth run in cloudflare worker

const APP_KEYS = {
  downGit: {
    client_id: 'd8d36704730f971d59a6',
    client_secret: '58ec91185d46c7d6d97acff06c9135866b384b33'
  },
}

  
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
  
/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  let params = null
  try {
    params = await request.json()
  } catch (e) {}
  
  if (!params || !APP_KEYS[params.appName]) {
    return new Response(JSON.stringify({
      code: 1,
      message: 'github app not found'
    }), {
      status: 200,
      headers: {
        "content-type": "application/json;charset=UTF-8"
      }
    })
  }
  const body = Object.assign({}, APP_KEYS[params.appName], {
      code: params.code
  });
  if (params.redirect_uri) body.redirect_uri = params.redirect_uri
  if (params.state) body.state = params.state
  
  const result = await fetch('https://github.com/login/oauth/access_token', {
    method: 'post',
    headers: { 'content-type': 'application/json', 'accept': 'application/json' },
    body: JSON.stringify(body)
  }).then(res => res.json()).then(res => JSON.stringify(res))
  return new Response(result, {status: 200, headers: { "content-type": "application/json;charset=UTF-8" }})
}
