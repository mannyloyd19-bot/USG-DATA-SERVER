function getToken(){return localStorage.getItem('usg_token')||'';}
function setToken(t){localStorage.setItem('usg_token',t);}
function clearToken(){localStorage.removeItem('usg_token');localStorage.removeItem('usg_user');}
function setUser(u){localStorage.setItem('usg_user',JSON.stringify(u||null));}
function getUser(){try{return JSON.parse(localStorage.getItem('usg_user')||'null')}catch{return null}}
function authHeaders(e={}){const t=getToken();return {...e,...(t?{Authorization:`Bearer ${t}`}:{})}}
async function apiFetch(u,o={}){const h=authHeaders(o.headers||{});const r=await fetch(u,{...o,headers:h});
if(r.status===401){clearToken();location.href='/login.html';throw new Error('Unauthorized')}
return r}
function requireAuth(){if(!getToken())location.href='/login.html';}
function logout(){clearToken();location.href='/login.html';}
window.logout=logout;
window.apiFetch=apiFetch;
window.requireAuth=requireAuth;
window.getUser=getUser;
