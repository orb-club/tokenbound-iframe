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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          fontSize: '1.25em',
          color: 'white',
          backgroundColor: '#181818',
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
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: '1em',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={profileImage || DEFAULT_IMAGE}
              alt="profile"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '0.5em',
              }}
            />
              <p style={{ 
                color: 'white', 
                fontWeight: 800,
                fontSize: '2em',
                fontFamily: '"Courier New", monospace'
              }}>
                @{handle}
              </p>
          </div>
          <img
            src="https://i.ibb.co/8mV2jjt/orb-logo-white.png"
            alt="logo"
            style={{
              width: '80px',
              height: '80px',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginTop: '0em',
            padding: '0.5em',
            borderRadius: '0.5em',
            backgroundColor: '#181818',
          }}
        >
          <h2 style={{ fontWeight: 800, color: 'white', width: '100%', textAlign: 'center' }}>Memberships</h2>
          {nftsToShow.slice(0, 12).map((allNft: { rawMetadata: { image: string | undefined; }; }, index: Key | null | undefined) => {
            const isLast = index === nftsToShow.slice(0, 12).length - 1 && additionalNftsCount > 0;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  borderRadius: '1em',
                  margin: '0.25em',
                  flexBasis: '22%',
                  flexGrow: 0,
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={allNft.rawMetadata.image || DEFAULT_IMAGE}
                  alt="nft"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    filter: isLast ? 'blur(2px)' : 'none',
                  }}
                />
                {isLast && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                      top: '0',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      backgroundColor: 'rgba(0,0,0,0.6)', // semi-transparent black background
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '2.5em',
                      zIndex: 1, // make sure the div is above the image
                      fontFamily: '"Arial", sans-serif', // New font family
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Text shadow for better legibility
                      textTransform: 'uppercase', // Transform the text to uppercase
                      letterSpacing: '2px', // Increase the spacing between letters
                    }}
                  >
                    +{additionalNftsCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      width: 850,
      height: 850,
    },
  );

  
  }