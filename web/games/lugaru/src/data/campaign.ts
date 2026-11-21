// Data/Campaigns/main.txt, converted to campaign.json by re/lugaru/tools/assets.py.
export interface CampaignLevel {
  name: string;
  description: string;
  chooseNext: number;
  numNext: number;
  nextLevel: number;
  locationX: number;
  locationY: number;
}

export interface Campaign {
  levels: CampaignLevel[];
  endText: string;
}

export function parseCampaign(json: unknown): Campaign {
  const c = json as Campaign;
  if (!c || !Array.isArray(c.levels) || c.levels.length === 0) throw new Error('not a Lugaru campaign');
  return c;
}
