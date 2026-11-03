// Starts a throwaway MongoDB (in memory) on port 27017 for local/CI test runs.
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const server = await MongoMemoryServer.create({
    instance: { port: Number(process.env.MONGO_PORT || 27017), ip: '127.0.0.1' },
    binary: { version: process.env.MONGOMS_VERSION || '8.0.4' },
  });
  console.log(`MongoDB ready at ${server.getUri()}`);
  const stop = async () => { await server.stop(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})();
