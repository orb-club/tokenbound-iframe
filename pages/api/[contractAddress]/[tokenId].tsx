/* eslint-disable import/no-anonymous-default-export */
import { ImageResponse } from '@vercel/og';
import { Key } from "react";
import { NextRequest } from 'next/server';


export const config = {
  runtime: 'edge',
}

export default async function handler(request: NextRequest) {

  const { searchParams } = request.nextUrl;
  const contractAddress = searchParams.get('contractAddress')
  const tokenId = searchParams.get('tokenId')

  const nftImagesString = searchParams.get('nftImages');
  const nftImage = JSON.parse(decodeURIComponent(nftImagesString!));

  const allNftsString = searchParams.get('allNfts');
  const allNfts = JSON.parse(decodeURIComponent(allNftsString!));

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 20,
          color: 'white',
          backgroundImage: `url(${nftImage})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%',
          paddingTop: 20,
          paddingLeft: 20,
        }}
      >
        <div
            style={{
              display: 'flex',
              flexWrap: 'wrap', // This property makes the items wrap onto the next line
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 120,
            }}
          >
            {allNfts.map((allNft: { rawMetadata: { image: string | undefined; }; }, index: Key | null | undefined) => (
              <img
                key={index}
                width="100"
                height="100"
                src={allNft.rawMetadata.image}
                style={{
                  borderRadius: 20,
                  margin: '5px', // Added margin to create spacing between images
                }}
              />
            ))}
        </div>
      </div>
    ),
    {
      width: 600,
      height: 700,
    },
  );
  }