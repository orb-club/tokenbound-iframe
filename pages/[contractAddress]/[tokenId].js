import { getAccount, getLensNfts, getNfts } from "../../lib/utils/index";
import { MAX_TOKEN_ID } from "../../lib/constants/index";
import { alchemy } from "../../lib/clients/index";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getProfile } from '../api/getLensProfile';
import { getProfileIdFromTokenId } from '../api/getProfileIdFromRegistry';

export default function Token({ contractAddress, tokenId }) {
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [nftImages, setNftImages] = useState([]);
  const [allNfts, setAllNfts] = useState([]);
  const [profileImage, setProfileImage] = useState('');
  const [handle, setHandle] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAccount(Number(tokenId), contractAddress);
        const account = result.data;

        const [data, lensData] = await Promise.all([getNfts(account), getLensNfts(account)]);
        const nfts = data ?? [];
        const lensNfts = lensData ?? [];
        const allNftsLocal = [...nfts, ...lensNfts];

        const simplifiedNfts = allNftsLocal.map(nft => {
          return {
            rawMetadata: {
              image: parseURL(nft.rawMetadata.image)
            }
          };
        });

        const nftImagesLocal = await getNftAsset(Number(tokenId), contractAddress);
        
        const profileId = await getProfileIdFromTokenId(tokenId, contractAddress);
        const profile = await getProfile(profileId);

        setNftImages(nftImagesLocal);
        setAllNfts(simplifiedNfts);
        setProfileImage(profile?.picture.original.url ? profile.picture.original.url : profile.picture.uri);
        setHandle(removeLens(profile?.handle));
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false); // Set loading state to false when data is finished loading
      }
    }
    fetchData();
  }, []);

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/${contractAddress}/${tokenId}?nftImages=${encodeURIComponent(JSON.stringify(nftImages))}&allNfts=${encodeURIComponent(JSON.stringify(allNfts))}&profileImage=${profileImage}&handle=${handle}`;

  return (
    <>
      <Head>
        <title>Memberships</title>
      </Head>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p style={{ fontSize: '24px', color: '#888' }}>Loading...</p>
        </div>
      ) : (
        <Image src={imageUrl} width={850} height={850} alt="All Memberships" />
      )}
    </>
  );  
}

export async function getServerSideProps({ params }) {
  const { contractAddress, tokenId } = params;
  return {
    props: {
      contractAddress,
      tokenId,
    }
  };
}

export async function getNftAsset(
  tokenId,
  contractAddress
){
  if (isTokenId(tokenId)) {
    const response = await alchemy.nft.getNftMetadata(contractAddress, tokenId)

    if (!response || !response.rawMetadata?.image) {
      throw new Error(`HTTP error! status: Could not getNftAsset ${response}`);
    }

    const result = parseURL(response.rawMetadata.image)
    return result;
  } else {
    throw new Error(`TokenId must be between 0 and ${MAX_TOKEN_ID}`);
  }
}

function stripOrb(url) {
  const baseURL = "media.orb.ac/thumbnailDimension768/";
  if (url.includes(baseURL)) {
    const l = url.split(baseURL);
    return `${l[l.length - 1]}`;
  } else {
    return url;
  }
}

function parseURL(url) {
  let cleanUrl = stripOrb(url);
  if (cleanUrl.includes("ipfs://")) {
    const l = cleanUrl.split("ipfs://");
    return `https://gateway.ipfscdn.io/ipfs/${l[l.length - 1]}`;
  } else if (cleanUrl.includes("ar://")) {
    const l = cleanUrl.split("ar://");
    return `https://arweave.net/${l[l.length - 1]}`;
  } else {
    cleanUrl = cleanUrl.replace("lens.infura-ipfs.io", "gateway.ipfscdn.io");
    return cleanUrl;
  }
}

function isTokenId(value) {
  return value >= 0 && value <= MAX_TOKEN_ID;
}

function removeLens(word) {
  // Check if the word ends with '.lens'
  if (word.endsWith('.lens')) {
    // Return the word without the last 5 characters ('.lens')
    return word.slice(0, -5);
  }
  // If the word does not end with '.lens', return it as it is
  return word;
}