export interface FarcasterUserResponse {
  result: {
    user: {
      fid: number;
      custodyAddress: string;
      username: string;
      displayName: string;
      pfp: {
        url: string;
      };
      profile: {
        bio: {
          text: string;
          mentionedProfiles: any[];
        };
      };
      followerCount: number;
      followingCount: number;
      verifications: string[];
      verifiedAddresses: {
        eth_addresses: string[];
        sol_addresses: string[];
      };
      activeStatus: string;
      powerBadge: boolean;
    };
  };
}