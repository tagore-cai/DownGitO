// scope could specified to repo to download private repo
//  or only public repo are available
function getGithubAuthUrl(scope) {
  const authUrl = 'https://github.com/login/oauth/authorize'
  const params = new URLSearchParams()
  const query = {
    client_id: 'd8d36704730f971d59a6',
    redirect_uri: 'https://downgit.weflare.win/auth.html',
    scope: scope,
    state: getRandomState()
  };
  Object.keys(query).forEach(key => {
    params.append(key, query[key])
  })
  return authUrl + '?' + params.toString()
}

function getRandomState() {
  const key = 'sunny-' + Math.random().toString(36).slice(2)
  localStorage.setItem('gh-salt', key)
  return key
}

/** return {access_token, token_type, scope}  */
function getAccessInfo () { 
  const acc = localStorage.getItem('gh-acc')
  if (!acc) return null
  return JSON.parse(atob(acc))
}

function getAccessToken () {
  const info = getAccessInfo()
  return info ? info.access_token : ''
}

function getCurrentUser() {
  const acc = getAccessInfo()
  if (!acc) return Promise.resolve({status: 'info', message: 'not auth yet'})
  return fetch('https://api.github.com/user', {
    headers: {
      'Accept': 'application/json',
      'Authorization': `token ${acc.access_token}`
    }
  }).then(res => {
    if (res.status <= 304) return res.json();
    return false
  }).then(res => {
    if (!res) return {status: 'danger', message: 'auth expired'}
    return {
      status: 'success',
      message: `auth as ${res.login}: ${acc.scope ? 'public and private repos' : 'public repos only'}`
    }
  }).catch((err) => {
    console.warn(err)
    return {status: 'danger',  message: 'network error'}
  })
}
