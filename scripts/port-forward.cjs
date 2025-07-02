try {
  const natUpnp = require('nat-upnp');
  const client = natUpnp.createClient();
  const internalPort = Number(process.env.INTERNAL_PORT || 5173);
  const externalPort = Number(process.env.EXTERNAL_PORT || internalPort);

  client.portMapping({ public: externalPort, private: internalPort, ttl: 3600, protocol: 'tcp' }, (err) => {
    if (err) {
      console.warn('⚠️  UPnP port mapping failed:', err.message || err);
    } else {
      console.log(`🔓 UPnP port forwarded: external ${externalPort} → internal ${internalPort}`);
    }
  });

  // Refresh mapping periodically
  setInterval(() => {
    client.portMapping({ public: externalPort, private: internalPort, ttl: 3600, protocol: 'tcp' }, () => {});
  }, 3000_000); // 50 min
} catch (e) {
  console.log('UPnP unavailable (nat-upnp not installed or router unsupported).');
}