'use strict';

const bootstrap = require("./bootstrap");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Run the initial seeding/bootstrap logic
    await bootstrap({ strapi });

    // GitHub Webhook Trigger
    strapi.db.lifecycles.subscribe({
      models: [], // empty = all models, triggers on any model update
      
      async afterUpdate(event) {
        const { model, params } = event;
        // Debug logging to see what events are firing and what data they have
        strapi.log.info(`[Lifecycle] afterUpdate fired for ${model.uid}`);
        strapi.log.info(`[Lifecycle] Data keys: ${Object.keys(params.data || {}).join(', ')}`);

        // Only trigger if content is being published (publishedAt is set in the update)
        if (params.data.publishedAt) {
          strapi.log.info(`[Lifecycle] Detected publish event for ${model.uid}`);
          try {
            await fetch('https://api.github.com/repos/vvdstudios/vividgamesite/dispatches', {
              method: 'POST',
              headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ event_type: 'strapi_update' })
            });
            strapi.log.info('GitHub Action triggered successfully');
          } catch (error) {
            strapi.log.error('Failed to trigger GitHub Action:', error);
          }
        }
      }
    });
  },
};
