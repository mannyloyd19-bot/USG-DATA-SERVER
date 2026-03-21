window.USGFormModal = function({ title = 'Form', fields = [], onSubmit }) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';

  const box = document.createElement('div');
  box.style.background = '#fff';
  box.style.borderRadius = '20px';
  box.style.padding = '20px';
  box.style.width = '400px';

  const inputs = fields.map(f => `
    <input id="${f.name}" placeholder="${f.label}" style="width:100%;margin-bottom:10px">
  `).join('');

  box.innerHTML = `
    <h3>${title}</h3>
    ${inputs}
    <button id="submitBtn">Submit</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  box.querySelector('#submitBtn').onclick = () => {
    const data = {};
    fields.forEach(f => {
      data[f.name] = box.querySelector(`#${f.name}`).value;
    });
    overlay.remove();
    onSubmit(data);
  };
};
