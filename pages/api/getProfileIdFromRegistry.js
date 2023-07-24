// pages/api/getProfileIdFromRegistry.js
const ethers = require("ethers");

const CONTRACT_ADDRESS = "0x02101dfB77FDE026414827Fdc604ddAF224F0921"
const IMPLEMENTATION = "0x2D25602551487C3f3354dD80D76D54383A243358"
const TOKEN_CONTRACT = '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'
const ORBSB_CONTRACT_ABI = require("../../abis/ORBSB_ABI.json")
const ERC6551_ABI = require("../../abis/ERC6551_ABI.json")
const PROVIDER = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT)

export async function getProfileIdFromTokenId(tokenId, MasterMembershipContractAddress) {
    // First we need to get the contract of the mastermembership contract
    // We have the contractAddress, we also have the abi
    const contract = new ethers.Contract(
        MasterMembershipContractAddress,
        ORBSB_CONTRACT_ABI.result,
        PROVIDER
    );

    // Now we need to call the function ownerOf(tokenId) on this contract
    const owner = await contract.ownerOf(tokenId)

    // Now we need to get the contract of the erc6551 registry
    const registryContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ERC6551_ABI.result,
        PROVIDER
    );

    // Here we need to check for events of type 'AccountCreated' and filter them for the owner address
    const profileIdBigNumber = await getProfileIdFromRegistry(registryContract, owner)
    const profileId = profileIdBigNumber.toHexString();
    return profileId
}

async function getProfileIdFromRegistry(contract, account) {
    try {
        // Fetch AccountCreated events
        const events = await contract.queryFilter("AccountCreated");
    
        // Filter events for the specific tokenId
        const matchingEvents = events.filter(
            (event) =>
            event.args.account.toLowerCase() ===
                account.toLowerCase() &&
            event.args.implementation.toLowerCase() ===
                IMPLEMENTATION.toLowerCase() &&
            event.args.tokenContract.toLowerCase() === TOKEN_CONTRACT.toLowerCase()
        );
    
        // Check if there are any matching events
        if (matchingEvents.length > 0) {
            // return the 'account' from the first matching event
            return matchingEvents[0].args.tokenId;
        } else {
            return 0;
        }
    } catch (error) {
        console.log("An error occurred:", error);
        return 0;
    }
}


export default async function handler(req, res) {
    if(req.method === 'POST') {
        const tokenId = req.body.tokenId
        const contractAddress = req.body.contractAddress

        const profileIdBigNumber = await getProfileIdFromTokenId(tokenId, contractAddress)
        const profileId = profileIdBigNumber.toHexString();

        res.status(200).json({ profileId });
    }
}
