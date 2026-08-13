(function () {
  function format(ms) {
    if (ms <= 0) return 'Closed';
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  }

  function tick() {
    document.querySelectorAll('.countdown').forEach((el) => {
      const status = el.dataset.status;
      if (status !== 'live') {
        el.textContent = status === 'sold' ? 'Sold' : 'Ended';
        return;
      }
      const end = new Date(el.dataset.end + 'Z').getTime();
      const remaining = end - Date.now();
      el.textContent = format(remaining);
      el.classList.toggle('urgent', remaining > 0 && remaining < 15 * 60 * 1000);
      if (remaining <= 0) {
        el.dataset.status = 'ended';
        el.textContent = 'Closing...';
        setTimeout(() => location.reload(), 1500);
      }
    });
  }

  tick();
  setInterval(tick, 1000);
})();
