(function () {
  let socket;

  function connect() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${protocol}://${location.host}`);

    socket.onopen = () => {
      console.log('[Realtime] connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleEvent(data);
      } catch {}
    };

    socket.onclose = () => {
      console.log('[Realtime] reconnecting...');
      setTimeout(connect, 2000);
    };
  }

  function handleEvent(event) {
    console.log('[Realtime event]', event);

    if (window.USGRealtimeHandlers) {
      window.USGRealtimeHandlers.forEach((fn) => {
        try { fn(event); } catch {}
      });
    }
  }

  window.USGRealtime = {
    on(fn) {
      window.USGRealtimeHandlers = window.USGRealtimeHandlers || [];
      window.USGRealtimeHandlers.push(fn);
    }
  };

  connect();
})();
