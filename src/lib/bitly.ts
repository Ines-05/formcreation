const BITLY_TOKEN = process.env.BITLY_TOKEN;
const BITLY_API = 'https://api-ssl.bitly.com/v4';

export interface BitlyResponse {
  created_at: string;
  id: string;
  link: string;
  custom_bitlinks: string[];
  long_url: string;
  archived: boolean;
  tags: string[];
  deeplinks: unknown[];
  references: {
    group: string;
  };
}

export async function shortenUrlWithBitly(longUrl: string): Promise<string> {
  if (!BITLY_TOKEN) {
    console.warn('⚠️ BITLY_TOKEN not found, returning original URL');
    return longUrl;
  }

  // Bitly ne peut pas raccourcir les URLs localhost, on retourne l'URL originale
  if (longUrl.includes('localhost') || longUrl.includes('127.0.0.1')) {
    console.warn('⚠️ Bitly cannot shorten localhost URLs, returning original URL');
    return longUrl;
  }

  try {
    const response = await fetch(`${BITLY_API}/shorten`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BITLY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        long_url: longUrl,
        domain: 'bit.ly', // Vous pouvez utiliser un domaine personnalisé si vous en avez un
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn('⚠️ Bitly API error, returning original URL:', error.message);
      return longUrl; // Retourner l'URL originale en cas d'erreur
    }

    const data: BitlyResponse = await response.json();
    console.log('✅ Bitly shortened:', data.link);
    return data.link;

  } catch (error) {
    console.warn('⚠️ Error shortening URL with Bitly, returning original URL:', error);
    return longUrl; // Retourner l'URL originale en cas d'erreur
  }
}

export async function getBitlyClickStats(bitlink: string): Promise<{
  total_clicks: number;
  link_clicks: Array<{ date: string; clicks: number }>;
} | null> {
  if (!BITLY_TOKEN) {
    console.warn('⚠️ BITLY_TOKEN not found');
    return null;
  }

  try {
    // Extraire l'ID du bitlink (ex: bit.ly/abc123 -> abc123)
    const bitlinkId = bitlink.replace('https://', '').replace('http://', '');

    const response = await fetch(`${BITLY_API}/bitlinks/${bitlinkId}/clicks/summary?unit=day&units=30`, {
      headers: {
        'Authorization': `Bearer ${BITLY_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('❌ Error fetching Bitly stats');
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Error getting Bitly stats:', error);
    return null;
  }
}
