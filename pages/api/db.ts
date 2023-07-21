// pages/api/db.ts
import { MongoClient, ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

async function getMasterMembershipProfileIdFromDB(tokenId: string) {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect()

    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection(process.env.MONGO_MASTER_MEMBERSHIP_COLLECTION!);

    const token = await collection.findOne({ masterMembershipTokenId: tokenId });
    if (token) {
        return token.profileId;
    } else {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST') {
        const tokenId = req.body.tokenId
        console.log("TokenId is ",tokenId)

        const profileId = await getMasterMembershipProfileIdFromDB(tokenId)
        console.log("profileId is ",profileId)
        console.log(profileId)
        res.status(200).json({ profileId });
    }
}
