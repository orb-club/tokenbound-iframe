import { getAccount, getLensNfts, getNfts } from "../../lib/utils/index";
import { MAX_TOKEN_ID } from "../../lib/constants/index";
import { alchemy } from "../../lib/clients/index";
import Head from "next/head";
import Image from "next/image";

export default function Token({ contractAddress, tokenId, account, nftImages, allNfts, profileImage, handle }) {

  // Convert the tokens array into a URL-friendly string
  const nftImagesParam = encodeURIComponent(JSON.stringify(nftImages));
  const allNftsParam = encodeURIComponent(JSON.stringify(allNfts));

  const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/${contractAddress}/${tokenId}?nftImages=${nftImagesParam}&allNfts=${allNftsParam}&profileImage=${profileImage}&handle=${handle}`;

  return (
    <>
      <Head>
        <title>Memberships</title>
        <meta
          property="og:image"
          content={imageUrl}
        />
      </Head>
      <Image src={imageUrl} width={700} height={700} alt="All Memberships" />
    </>
  )
}

export async function getServerSideProps({ params }) {
  const { contractAddress, tokenId } = params;

  try {
    // Fetch nft's TBA
    const result = await getAccount(Number(tokenId), contractAddress);
    const account = result.data;

    // Fetch nfts inside TBA
    const [data, lensData] = await Promise.all([getNfts(account), getLensNfts(account)]);
    const nfts = data ?? [];
    const lensNfts = lensData ?? [];
    const allNfts = [...nfts, ...lensNfts];

    const simplifiedNfts = allNfts.map(nft => {
      return {
        rawMetadata: {
          image: parseURL(nft.rawMetadata.image)
        }
      };
    });

    const nftImages = await getNftAsset(Number(tokenId), contractAddress);

    // Call the API to get the profileId
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: tokenId }),
    });
    const dbData = await res.json();
    const profileId = dbData.profileId;

    // Call the API to get the profile
    const resProfile = await fetch('/api/getLensProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileId: profileId }),
    });
    const profileData = await resProfile.json();
    const profile = profileData.profile;

    return {
      props: {
        contractAddress,
        tokenId,
        account,
        nftImages,
        allNfts: simplifiedNfts,
        profileImage: profile?.picture.original.url ? profile.picture.original.url : profile.picture.uri,
        handle: profile?.handle,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}

function isTokenId(value) {
  return value >= 0 && value <= MAX_TOKEN_ID;
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