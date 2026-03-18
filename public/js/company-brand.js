(function () {
  function applyBrand() {
    const logoPath = '/assets/company-logo.png';

    document.querySelectorAll('.logo').forEach((el) => {
      if (el.dataset.brandApplied === 'true') return;
      el.dataset.brandApplied = 'true';
      el.innerHTML = '<img src="' + logoPath + '" alt="Company Logo" style="width:100%;height:100%;object-fit:contain;border-radius:18px" onerror="this.style.display=\'none\'; this.parentNode.textContent=\'U\';">';
    });

    document.querySelectorAll('.brand h1').forEach((el) => {
      if (el.dataset.brandTitleApplied === 'true') return;
      el.dataset.brandTitleApplied = 'true';
      el.innerHTML = 'UNI-SOGOOD<br>USG DATA SERVER';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrand);
  } else {
    applyBrand();
  }
})();
