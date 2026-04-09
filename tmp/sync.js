const { syncRegistry } = require('./src/lib/registry');
syncRegistry().then(() => {
    console.log('Registry synced successfully.');
}).catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
});
