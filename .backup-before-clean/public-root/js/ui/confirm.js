window.USGConfirm = async function(message = 'Are you sure?') {
  return new Promise((resolve) => {
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
    box.style.width = '320px';

    box.innerHTML = `
      <div style="font-weight:600;margin-bottom:10px">${message}</div>
      <div style="display:flex;justify-content:flex-end;gap:10px">
        <button id="cancelBtn">Cancel</button>
        <button id="okBtn">OK</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector('#cancelBtn').onclick = () => {
      overlay.remove();
      resolve(false);
    };

    box.querySelector('#okBtn').onclick = () => {
      overlay.remove();
      resolve(true);
    };
  });
};
