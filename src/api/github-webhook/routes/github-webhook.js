module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/github-webhook/trigger',
      handler: 'github-webhook.trigger',
      config: {
        auth: false, // Security: we'll check a custom header or query param if needed, or rely on obscure URL
      },
    },
  ],
};

