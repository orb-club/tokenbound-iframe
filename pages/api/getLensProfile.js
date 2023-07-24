// pages/api/getLensProfile.js
import axios from "axios";

const LENS_ENDPOINT = "https://api.lens.dev/";

export function parseURL(url) {
    if (url.includes("ipfs://")) {
      const l = url.split("ipfs://");
      return `https://gateway.ipfscdn.io/ipfs/${l[l.length - 1]}`;
    } else if (url.includes("ar://")) {
      const l = url.split("ar://");
      return `https://arweave.net/${l[l.length - 1]}`;
    } else {
        url = url.replace("lens.infura-ipfs.io", "gateway.ipfscdn.io");
      return url;
    }
  }

export const applyIpfsGatewayToProfilePicture = (obj) => {
    let tempprofile = { ...obj };
    let picture = tempprofile.picture;
    if(picture && picture?.__typename == 'MediaSet' && picture.original && picture.original.url)
    {
      picture.original.url = parseURL(picture.original.url)
    }
    else if(picture && picture?.__typename == 'NftImage' && picture.uri)
    {
      picture.uri = parseURL(picture.uri)
    }
    return tempprofile
  };

export async function getProfile(profileId) {
    try {
      const response = await axios.post(LENS_ENDPOINT, {
        query: `
        query Profile($profileId: ProfileId!) {
            profile(request: { profileId: $profileId }) {
              id
              name
              picture {
                ... on NftImage {
                  contractAddress
                  tokenId
                  uri
                  verified
                }
                ... on MediaSet {
                  original {
                    url
                    mimeType
                  }
                }
                __typename
              }
              handle
              ownedBy
            }
          }
        `,
        variables: {
            profileId,
        },
      });
  
      let profileData = response.data.data.profile;

      profileData = applyIpfsGatewayToProfilePicture(profileData)
  
      return profileData;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

export default async function handler(req, res) {
    if(req.method === 'POST') {
        const profileId = req.body.profileId

        const profile = await getProfile(profileId)

        res.status(200).json({ profile });
    }
}
