'use strict';

module.exports = {
  async trigger(ctx) {
    try {
      strapi.log.info('Received request to trigger GitHub Action via custom endpoint');

      // 1. (Optional) Verify a secret token from Strapi Webhook headers if you want extra security
      // const token = ctx.request.headers['x-strapi-webhook-token'];
      // if (token !== process.env.STRAPI_WEBHOOK_SECRET) return ctx.forbidden();

      // 2. Trigger GitHub Dispatch
      const response = await fetch('https://api.github.com/repos/vvdstudios/vividgamesite/dispatches', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: 'strapi_update' })
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`GitHub API error: ${response.status} ${errorText}`);
        return ctx.badRequest('Failed to trigger GitHub Action');
      }

      strapi.log.info('GitHub Action triggered successfully via custom endpoint');
      ctx.send({ message: 'GitHub Action triggered' });

    } catch (error) {
      strapi.log.error('Error in github-webhook controller:', error);
      ctx.internalServerError('Internal Error');
    }
  }
};

