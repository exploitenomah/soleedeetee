const http = require('http')
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config('./.env')

const connect = async () => {
const uri = process.env.CONNECTION_STRING
  try {
    const client = await new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
      .connect();
    let db = client.db('lottery');
    return {
      client,
      db,
    };
  } catch (err) {
    console.error('UNABLE TO CONNECT TO DATABASE!!! ❌❌❌❌❌ ERROR: ==>>> ', err);
    process.exit(1);
  } 
}
const getLatestDeployedInterface = async () => {
  const { client, db } = await connect()
  try{ 
    const latest = await db.collection('lottery').findOne({ is_most_recent: true })
    return latest
  }finally{
    await client.close()
  }
}
const reqListener = async (req, res) => {
  if(req.method === 'GET'){
    res.writeHead(200)
    res.end(JSON.stringify({ data: await getLatestDeployedInterface()}))
  }else{
    res.writeHead(404).end(JSON.stringify({ message: `CANNOT ${req.method} ${req.originalUrl} on this server`}))
  }
}
const server = http.createServer(reqListener)

server.listen(2023)
console.log('now listening on port ', 2023)