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
        // Only trigger if content is being published (publishedAt is set in the update)
        if (event.params.data.publishedAt) {
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
