import { Command } from 'commander';
import { getEntities, upsertEntity, getClient } from './src/port_client';
import { 
  generateActionImports, 
  generateBlueprintImports, 
  generateScorecardImports,
  generateIntegrationImports,
  generateWebhookImports,
  writeImportBlocksToFile 
} from './src/tf_import_block_generator';

async function main() {
  const PORT_CLIENT_ID = process.env.PORT_CLIENT_ID;
  const PORT_CLIENT_SECRET = process.env.PORT_CLIENT_SECRET;

  if (!PORT_CLIENT_ID || !PORT_CLIENT_SECRET) {
    console.log('Please provide env vars PORT_CLIENT_ID and PORT_CLIENT_SECRET');
    process.exit(0);
  }

  try {
    const client = await getClient();
    console.log('fetching actions');
    const actions = await client.get('/actions');
    console.log('fetching blueprints');
    const blueprints = await client.get('/blueprints');
    console.log('fetching scorecards');
    const scorecards = await client.get('/scorecards');
    console.log('fetching integrations');
    const integrations = await client.get('/integration');
    console.log('fetching webhooks');
    const webhooks = await client.get('/webhooks');


    console.log('generating tf import files');
    const actionImports = await generateActionImports(actions.actions);
    const blueprintImports = await generateBlueprintImports(blueprints.blueprints);
    const scorecardImports = await generateScorecardImports(scorecards.scorecards);
    const integrationImports = await generateIntegrationImports(integrations.integrations);
    const webhookImports = await generateWebhookImports(webhooks.integrations);

    await Promise.all([
        writeImportBlocksToFile(actionImports, 'action_imports.tf'),
        writeImportBlocksToFile(blueprintImports, 'blueprint_imports.tf'),
        writeImportBlocksToFile(scorecardImports, 'scorecard_imports.tf'),
        writeImportBlocksToFile(integrationImports, 'integration_imports.tf'),
        writeImportBlocksToFile(webhookImports, 'webhook_imports.tf')
    ]);


//     const program = new Command();

//     program
//       .name('export-buddy')
//       .description('CLI grab all the entities you want to codify in terraform');

//     program
//       .command('add-all-import-blocks')
//       .description('Add all import blocks all blueprints, mappings, actions and automations')
//       .action(async () => {
//         // get the data
//         // create the tf import blocks 
//       });


//     await program.parseAsync();

  } catch (error) {
    console.error('Error:', error);
  }
}

main();