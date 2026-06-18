// pages/api/getProfileIdFromRegistry.js
import { getAddress } from "viem";
import { rpcClient } from "../../lib/clients/viem";

const CONTRACT_ADDRESS = "0x02101dfB77FDE026414827Fdc604ddAF224F0921"
const IMPLEMENTATION = "0x2D25602551487C3f3354dD80D76D54383A243358"
const TOKEN_CONTRACT = '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'
const ORBSB_CONTRACT_ABI = require("../../abis/ORBSB_ABI.json")
const ERC6551_ABI = require("../../abis/ERC6551_ABI.json")

// The ABIs are stored as a JSON-encoded string under `result`, so parse them
// into the array form viem expects.
const ORBSB_ABI = JSON.parse(ORBSB_CONTRACT_ABI.result)
const REGISTRY_ABI = JSON.parse(ERC6551_ABI.result)

const ACCOUNT_CREATED_EVENT = REGISTRY_ABI.find(
    (item) => item.type === "event" && item.name === "AccountCreated"
)

export async function getProfileIdFromTokenId(tokenId, MasterMembershipContractAddress) {
    // First we need to get the contract of the mastermembership contract and
    // call ownerOf(tokenId) on it.
    const owner = await rpcClient.readContract({
        address: getAddress(MasterMembershipContractAddress),
        abi: ORBSB_ABI,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
    })

    // Here we need to check for events of type 'AccountCreated' and filter them
    // for the owner address.
    const profileIdBigNumber = await getProfileIdFromRegistry(owner)
    // Preserve the previous ethers `BigNumber.toHexString()` return shape.
    const profileId = profileIdBigNumber === 0 ? 0 : `0x${profileIdBigNumber.toString(16)}`;
    return profileId
}

async function getProfileIdFromRegistry(account) {
    try {
        // Fetch AccountCreated events across the full chain history (mirrors the
        // previous ethers `queryFilter("AccountCreated")` with no block range).
        const events = await rpcClient.getLogs({
            address: getAddress(CONTRACT_ADDRESS),
            event: ACCOUNT_CREATED_EVENT,
            fromBlock: 0n,
            toBlock: "latest",
        });

        // Filter events for the specific account
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
            // return the 'tokenId' from the first matching event
            return matchingEvents[0].args.tokenId;
        } else {
            return 0;
        }
    } catch (error) {
        console.log("An error occurred:", error);
        return 0;
    }
}
