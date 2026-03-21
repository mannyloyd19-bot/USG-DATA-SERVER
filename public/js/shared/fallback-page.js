window.USGFallbackPage = function(name){
  USGPageBootstrap.init(name);
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="card">
      <div class="kicker">COMING SOON</div>
      <h2>${name}</h2>
      <div class="muted">This module is not fully implemented yet.</div>
    </div>
  `;
};
