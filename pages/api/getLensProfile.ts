// pages/api/getLensProfile.ts
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { Profile, ProfileId } from "@lens-protocol/react-web";

const LENS_ENDPOINT = "https://api.lens.dev/";

export function parseURL(url: string) {
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

export const applyIpfsGatewayToProfilePicture = (obj: Profile) => {
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

async function getProfile(profileId: ProfileId) {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST') {
        const profileId = req.body.profileId
        console.log("profileId received is ",profileId)

        const profile = await getProfile(profileId)
        console.log(profile)

        res.status(200).json({ profile });
    }
}
