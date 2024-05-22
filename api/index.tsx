import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { Box, Heading, Text, Image, VStack, vars, HStack } from "../ui.js"
import { toTokens } from 'thirdweb'
import { NFTsResponse } from '../types/simplehash.js'
import { FarcasterUserResponse } from '../types/farcaster.js'

// Uncomment to use Edge Runtime.
export const config = {
  runtime: 'edge',
}

type State = {
  cursor: string;
  nftIndex: number;
  user: string;
}

export const app = new Frog<{ State: State }>({
  ui: { vars },
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY! }),
  initialState: {
    cursor: "",
    nftIndex: 0,
    user: "",
  },
  imageAspectRatio: '1:1',
});

// Uncomment to use Edge Runtime
export const runtime = 'edge'

app.frame('/', (c) => {
  console.log({ c })
  return c.res({
    action: `/user/${undefined}`,
    image: "https://ipfs.io/ipfs/QmPwBWJmpBJMc3nLRxgHUuT1SNxagHxBJtcE7CmnQmfkCH/Hiring!.png",
    intents: [
      <TextInput placeholder="Enter username..." />,
      <Button>View Mints</Button>,
    ]
  })
})

app.frame('/user/:username', async (c) => {
  const { inputText, buttonValue, deriveState, req } = c;
  const username = req.param('username');
  const state = deriveState(previousState => {
    if (buttonValue === 'Next') {
      previousState.nftIndex++;
    }
    if (buttonValue === 'Previous') {
      previousState.nftIndex--;
    }
  });
  console.log({ state });
  if (buttonValue === 'Home') {
    state.cursor = '';
    state.nftIndex = 0;
    return c.res({
      action: `/user/${undefined}`,
      image: "https://ipfs.io/ipfs/QmPwBWJmpBJMc3nLRxgHUuT1SNxagHxBJtcE7CmnQmfkCH/Hiring!.png",
      intents: [
        <TextInput placeholder="Enter username..." />,
        <Button>View Mints</Button>,
      ]
    })
  }
  if (username && (!state.user || state.user === "")) {
    state.user = username;
  }
  if (inputText) {
    state.user = inputText;
  }
  if (!inputText && !state.user) {
    return c.res({
      action: `/user/${undefined}`,
      image: "https://ipfs.io/ipfs/QmPwBWJmpBJMc3nLRxgHUuT1SNxagHxBJtcE7CmnQmfkCH/Hiring!.png",
      intents: [
        <TextInput placeholder="Enter username..." />,
        <Button>View Mints</Button>,
      ]
    })
  }
  const neynarOptions = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: process.env.NEYNAR_API_KEY!},
  };
  const farcasterUserRes = await fetch(`https://api.neynar.com/v1/farcaster/user-by-username?username=${state.user}`, neynarOptions);
  const farcasterUserResJson = await farcasterUserRes.json() as FarcasterUserResponse;
  const farcasterUser = farcasterUserResJson.result.user;

  const simplehashOptions = {
    method: 'GET',
    headers: {accept: 'application/json', 'X-API-KEY': process.env.SIMPLEHASH_API_KEY!},
  };
  const chains = 'base';
  const wallet_addresses = farcasterUser.verifiedAddresses.eth_addresses.join(',');
  const nfts = await fetch(`https://api.simplehash.com/api/v0/nfts/owners?chains=${chains}&wallet_addresses=${wallet_addresses}&cursor=${state.cursor === '' ? undefined : state.cursor}`, simplehashOptions);
  const nftsJson = await nfts.json() as NFTsResponse;
  console.log({ nftsJson });
  if (nftsJson.nfts.length === state.nftIndex + 1) {
    state.cursor = nftsJson.next_cursor;
    state.nftIndex = 0;
  }
  if (state.nftIndex < 0) {
    state.nftIndex = 0;
  }
  const nft = nftsJson.nfts[state.nftIndex];
  console.log({ nftIndex: state.nftIndex, nft: JSON.stringify(nft) });
  const link = nft.collection.marketplace_pages?.length > 0 ? nft.collection.marketplace_pages[0] : {
    marketplace_id: 'opensea',
    marketplace_name: 'OpenSea',
    marketplace_collection_id: nft.collection.collection_id,
    nft_url: `https://opensea.io/assets/base/${nft.contract_address}/${nft.token_id}`,
    collection_url: `https://opensea.io/assets/base/${nft.contract_address}`,
    verified: true,
  }
  const lastAcquiredDate = nft.owners.find(owner => farcasterUser.verifiedAddresses.eth_addresses.some(address => address.toLowerCase() === owner.owner_address.toLowerCase()))?.last_acquired_date;
  const floorPrice = nft.collection.floor_prices.reduce((min, price) => price.value_usd_cents < min.value_usd_cents ? price : min, nft.collection.floor_prices[0]);
  return c.res({
    image: (
      <Box
        grow
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4">
          <HStack gap="2" alignHorizontal="space-between" alignVertical="center">
            <Image src={nft.previews.image_small_url} height={"256"} width={"256"} />
            <HStack gap="2">
              <Image src={farcasterUser.pfp.url} height={"80"} width={"80"} />
              <VStack gap="2" alignVertical="center">
                <Text color="text200" size="20">
                  {farcasterUser.displayName}
                </Text>
                <Text color="text200" size="16">
                  @{farcasterUser.username}
                </Text>
              </VStack>
            </HStack>
          </HStack>
          <Heading>{nft.collection.name ? nft.collection.name + ' #' + nft.token_id : ""}</Heading>
          <Text color="text200" size="20">
            {nft.collection.description ? nft.collection.description?.substring(0, 400) + (nft.collection.description?.length > 400 ? "..." : "") : ""}
          </Text>
          <Text color="text200" size="20">
            {lastAcquiredDate ? `Acquired: ${new Date(lastAcquiredDate).toLocaleDateString([], {
              dateStyle: 'short',
            })}` : ''}
          </Text>
          <Text color="text200" size="20">
            {floorPrice ? `Floor Price: ${Number(toTokens(BigInt(floorPrice.value), floorPrice.payment_token.decimals)).toLocaleString([], { currency: 'USD', minimumFractionDigits: Number(toTokens(BigInt(floorPrice.value), floorPrice.payment_token.decimals)) < 1 ? 2 : 0 })} ${floorPrice.payment_token.symbol} ($${(floorPrice.value_usd_cents / 100).toLocaleString([], { currency: 'USD' })})` : ''}
          </Text>
        </VStack>
        <Box gap="4" alignHorizontal="right" alignVertical="bottom" position="absolute" bottom="20" right="20">
          <Text color="text200" size="16">
            watchya mintin? by myk.eth
          </Text>
        </Box>
      </Box>
    ),
    imageOptions: { width: 1200, height: 1200 },
    intents: [
      <Button value='Home'>🔎 New User</Button>,
      <Button.Link href={link.nft_url}>{link.marketplace_name}</Button.Link>,
      <Button value='Previous'>Previous</Button>,
      <Button value="Next">Next</Button>,
    ]
  })
})
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
