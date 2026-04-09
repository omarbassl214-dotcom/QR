const { getRegistryIndex } = require('./src/lib/registry');
const start = Date.now();
getRegistryIndex().then(index => {
    const end = Date.now();
    console.log(`Execution time: ${end - start}ms`);
    console.log('Categories:', index.categories.length);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
