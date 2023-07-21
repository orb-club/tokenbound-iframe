/* eslint-disable import/no-anonymous-default-export */
import { ImageResponse } from '@vercel/og';
import { Key } from "react";
import { NextRequest } from 'next/server';
import Image from 'next/image';


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

  const tempAllNfts = [...allNfts]
 
  const maxNftsToShow = 16;
  const additionalNftsCount = tempAllNfts.length > maxNftsToShow ? tempAllNfts.length - maxNftsToShow : 0;
  const nftsToShow = tempAllNfts.slice(0, maxNftsToShow);

  // const profileImage = searchParams.get('profileImage')
  // const handle = searchParams.get('handle')

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.25em', // using em makes the font size relative to the parent
          color: 'white',
          backgroundImage: `url(${nftImage})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '100%',
          height: '100%',
          paddingTop: '2em',
          paddingLeft: '2em',
          paddingRight: '2em',
          paddingBottom: '2em',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center', // centering and even spacing
            alignItems: 'center',
            marginTop: '6em',
            padding: '1em', // padding inside the container
            borderRadius: '0.5em',
            backgroundColor: 'rgba(0,0,0,0.5)', // a slightly transparent background to help the images pop up
          }}
        >
          {nftsToShow.map((allNft: { rawMetadata: { image: string | undefined; }; }, index: Key | null | undefined) => (
            <img
              key={index}
              width="100"
              height="100"
              src={allNft.rawMetadata.image || 'https://i.ibb.co/mGtcy3j/twitter-OG.png'}
              alt="nft"
              style={{
                borderRadius: '1em',
                margin: '0.5em', // spacing between images
                boxShadow: '0 0 10px rgba(0,0,0,0.5)', // shadow for a 3D effect
              }}
            />
          ))}
          {additionalNftsCount > 0 && 
            <p style={{ marginTop: '1em', color: 'white' }}>
              {`And ${additionalNftsCount} more...`}
            </p>
          }
        </div>
        <div
        style={{
          position: 'absolute',
          bottom: '0em',
          left: '1em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // to center the text and image
        }}
      >
        <img
          src='https://ik.imagekit.io/lens/media-snapshot/tr:w-1000,h-1000/041f4a7d8e46e9f9fb82865c9ae42af896e60675685b02b87f04dbcce2375b52.jpg'
          alt="profile"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%', // to make the image circular
            objectFit: 'cover',
          }}
        />
        <p style={{ marginTop: '0.5em', color: 'white' }}>Nilesh</p>
      </div>
      </div>
    ),
    {
      width: 600,
      height: 700,
    },
  );
  
  }