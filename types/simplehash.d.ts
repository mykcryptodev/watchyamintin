interface NFT {
  nft_id: string;
  chain: string;
  contract_address: string;
  token_id: string;
  name: string;
  description: string;
  previews: {
    image_small_url: string;
    image_medium_url: string;
    image_large_url: string;
    image_opengraph_url: string;
    blurhash: string;
    predominant_color: string;
  };
  image_url: string;
  image_properties: {
    width: number;
    height: number;
    size: number;
    mime_type: string;
  };
  video_url: string | null;
  video_properties: any | null;
  audio_url: string | null;
  audio_properties: any | null;
  model_url: string | null;
  model_properties: any | null;
  other_url: string | null;
  other_properties: any | null;
  background_color: string | null;
  external_url: string | null;
  created_date: string;
  status: string;
  token_count: number;
  owner_count: number;
  owners: Array<{
    owner_address: string;
    quantity: number;
    quantity_string: string;
    first_acquired_date: string;
    last_acquired_date: string;
  }>;
  contract: {
    type: string;
    name: string;
    symbol: string;
    deployed_by: string;
    deployed_via_contract: string | null;
    owned_by: string;
    has_multiple_collections: boolean;
  };
  collection: {
    collection_id: string;
    name: string;
    description: string;
    image_url: string;
    image_properties: {
      width: number;
      height: number;
      mime_type: string;
    };
    banner_image_url: string | null;
    category: string | null;
    is_nsfw: boolean;
    external_url: string | null;
    twitter_username: string | null;
    discord_url: string | null;
    instagram_username: string | null;
    medium_username: string | null;
    telegram_url: string | null;
    marketplace_pages: Array<{
      marketplace_id: string;
      marketplace_name: string;
      marketplace_collection_id: string;
      nft_url: string;
      collection_url: string;
      verified: boolean | null;
    }>;
    metaplex_mint: string | null;
    metaplex_candy_machine: string | null;
    metaplex_first_verified_creator: string | null;
    floor_prices: Array<{
      marketplace_id: string;
      marketplace_name: string;
      value: number;
      payment_token: {
        payment_token_id: string;
        name: string;
        symbol: string;
        address: string | null;
        decimals: number;
      };
      value_usd_cents: number;
    }>;
    top_bids: Array<any>;
    distinct_owner_count: number;
    distinct_nft_count: number;
    total_quantity: number;
    chains: Array<string>;
    top_contracts: Array<string>;
    collection_royalties: Array<{
      source: string;
      total_creator_fee_basis_points: number;
      recipients: Array<any>;
    }>;
  };
  last_sale: any | null;
  first_created: any;
  rarity: any;
  royalty: Array<any>;
  extra_metadata: any;
}

export interface NFTsResponse {
  next_cursor: string;
  next: string;
  previous: string | null;
  nfts: NFT[];
}
