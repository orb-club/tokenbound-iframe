/* eslint-disable import/no-anonymous-default-export */
import { ImageResponse } from '@vercel/og';
import { Key } from "react";
import { NextRequest } from 'next/server';
import Image from 'next/image';

export const config = {
  runtime: 'edge',
}

const DEFAULT_IMAGE = 'https://orb-test-media.s3.us-east-1.amazonaws.com/milad-fakurian-nY14Fs8pxT8-unsplash.jpeg';

export default async function handler(request: NextRequest) {

  const { searchParams } = request.nextUrl;
  const contractAddress = searchParams.get('contractAddress')
  const tokenId = searchParams.get('tokenId')

  const nftImagesString = searchParams.get('nftImages');
  const nftImage = JSON.parse(decodeURIComponent(nftImagesString!));

  const allNftsString = searchParams.get('allNfts');
  const allNfts = JSON.parse(decodeURIComponent(allNftsString!));

  const tempAllNfts = [...allNfts]
 
  const maxNftsToShow = 12;
  const additionalNftsCount = tempAllNfts.length > maxNftsToShow ? tempAllNfts.length - maxNftsToShow : 0;
  const nftsToShow = tempAllNfts.slice(0, maxNftsToShow);

  const profileImage = searchParams.get('profileImage')
  const handle = searchParams.get('handle')

  return new ImageResponse(
    (
      <div tw="flex flex-col justify-start items-center text-lg text-white bg-zinc-800 w-full h-full py-8 px-8">
        <div tw="flex justify-between items-center w-full mb-4">
          <div tw="flex items-center">
            <img
              src={profileImage || DEFAULT_IMAGE}
              alt="profile"
              tw="w-20 h-20 rounded-full mr-2"
              style={{ objectFit: 'contain' }}
            />
              <h2 tw="text-white font-bold text-4xl font-mono">
                @{handle}
              </h2>
          </div>
          <img
            src="https://i.ibb.co/DLPxNsx/Webp-net-resizeimage.png"
            alt="logo"
            tw="w-20 h-20"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div tw="flex justify-center w-full">
          <div tw="flex flex-wrap justify-center items-start mt-0 py-2 px-2 rounded-md bg-zinc-800">
            <h2 tw="font-bold text-white w-full text-center">Memberships</h2>
            {nftsToShow.slice(0, 12).map((allNft: { rawMetadata: { image: string | undefined; }; }, index: Key | null | undefined) => {
              const isLast = index === nftsToShow.slice(0, 12).length - 1 && additionalNftsCount > 0;
              return (
                <div
                  key={index}
                  tw="flex flex-col justify-center items-center relative rounded-md m-2 flex-none w-40 h-40"
                >
                  <img
                    src={allNft.rawMetadata.image || DEFAULT_IMAGE}
                    alt="nft"
                    tw={`rounded-md w-40 h-40 ${isLast ? 'blur' : ''}`}
                    style={{ objectFit: 'contain' }}
                  />
                  {isLast && (
                    <div tw="flex justify-center items-center absolute inset-0 bg-black bg-opacity-60 text-white font-bold text-5xl z-10 font-sans text-shadow uppercase tracking-wider">
                      +{additionalNftsCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      </div>
      </div>
    ),
    {
      width: 850,
      height: 850,
    },
  );
  
  }