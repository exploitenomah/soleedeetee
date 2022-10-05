
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

const storeDeployedContractInfo = async ({ abi, address, }) => {
  const {client, db} = await connect()
  try{
    const prevLatest = await db.collection('lottery').findOneAndUpdate(
      { is_most_recent: true}, 
      { $set: {is_most_recent: false, }},
      { upsert: false })
    const currentLatest = await db.collection('lottery').insertOne({
      abi, 
      address, 
      deployed_at: new Date(),
      created_at: new Date(),
      is_most_recent: true
    })
    return currentLatest
  }catch(err){
    console.error('UNABLE TO SAVE CONTRACT!!! ❌❌❌❌❌ ERROR: ==>>> ', err)
    process.exit(1)
  }finally{
    await client.close()
  }
}

module.exports = {
  storeDeployedContractInfo
}
