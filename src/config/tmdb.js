// TMDB Configuration and Curated Lists for Loom Movies

export const TMDB_CONFIG = {
  API_KEY: '027b62cb3fa7e17e32f560aa27a93c48',
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  
  // Image URL Helper functions
  posterUrl: (path) => path ? (path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w342${path}`) : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500',
  backdropUrl: (path) => path ? (path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w1280${path}`) : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200',
};

// Curated lists with media_type ('movie' or 'tv') to fetch high-quality data
export const CURATED_LISTS = {
  marvel: [
    { id: 299534, type: 'movie', title: 'Avengers: Endgame' },
    { id: 533535, type: 'movie', title: 'Deadpool & Wolverine' },
    { id: 634649, type: 'movie', title: 'Spider-Man: No Way Home' },
    { id: 299536, type: 'movie', title: 'Avengers: Infinity War' },
    { id: 1726, type: 'movie', title: 'Iron Man' },
    { id: 284053, type: 'movie', title: 'Thor: Ragnarok' },
    { id: 84958, type: 'tv', title: 'Loki' },
    { id: 315635, type: 'movie', title: 'Spider-Man: Into the Spider-Verse' },
    { id: 85271, type: 'tv', title: 'WandaVision' },
    { id: 429617, type: 'movie', title: 'Spider-Man: Far From Home' },
    { id: 99861, type: 'movie', title: 'Avengers: Age of Ultron' },
    { id: 24428, type: 'movie', title: 'The Avengers' }
  ],
  islamic: [
    { 
      id: 'youtube-7X-q_4O7J1I', 
      type: 'movie', 
      title: 'Dr. Israr Ahmed - Bayan-ul-Quran (Part 1)',
      overview: 'Introduction to the Quran, Tafseer and the purpose of human creation by Dr. Israr Ahmed.',
      poster_path: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1597935258735-e254c1839512?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2010-01-01',
      runtime: 72,
      isCustom: true 
    },
    { 
      id: 'youtube-l9wY2oQ6_Jg', 
      type: 'movie', 
      title: 'Dr. Zakir Naik - Purpose of Life',
      overview: 'Famous public lecture and Q&A session explaining the purpose of human life in the light of the Holy Quran by Dr. Zakir Naik.',
      poster_path: 'https://images.unsplash.com/photo-1597935258735-e254c1839512?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200',
      vote_average: 9.7,
      release_date: '2015-05-10',
      runtime: 90,
      isCustom: true 
    },
    { 
      id: 'youtube-7d83vI8wJ9U', 
      type: 'movie', 
      title: 'Dr. Israr Ahmed - Real Success (Falah)',
      overview: 'A profound lecture defining true success in this life and the hereafter in the light of Surah Al-Asr by Dr. Israr Ahmed.',
      poster_path: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
      vote_average: 9.9,
      release_date: '2008-08-14',
      runtime: 65,
      isCustom: true 
    },
    { 
      id: 'youtube-s2a8DsbH5Lg', 
      type: 'movie', 
      title: 'Dr. Zakir Naik - Quran & Modern Science',
      overview: 'Famous lecture highlighting the connection and harmony between scientific discoveries and Quranic revelations by Dr. Zakir Naik.',
      poster_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1597935258735-e254c1839512?q=80&w=1200',
      vote_average: 9.6,
      release_date: '2018-12-25',
      runtime: 120,
      isCustom: true 
    }
  ],
  anime: [
    { id: 635302, type: 'movie', title: 'Demon Slayer: Mugen Train' },
    { id: 95479, type: 'tv', title: 'Jujutsu Kaisen' },
    { id: 31910, type: 'tv', title: 'Naruto Shippuden' },
    { id: 8782, type: 'tv', title: 'Death Note' },
    { id: 65930, type: 'tv', title: 'My Hero Academia' },
    { id: 114461, type: 'tv', title: 'Chainsaw Man' },
    { id: 372058, type: 'movie', title: 'Your Name' },
    { id: 877375, type: 'movie', title: 'Jujutsu Kaisen 0' },
    { id: 916224, type: 'movie', title: 'Suzume' },
    { id: 1429, type: 'tv', title: 'Attack on Titan' },
    { id: 46261, type: 'tv', title: 'Naruto' },
    { id: 37854, type: 'tv', title: 'One Piece' },
    { id: 94605, type: 'tv', title: 'Demon Slayer: Kimetsu no Yaiba' }
  ],
  kdrama: [
    { id: 203870, type: 'tv', title: 'Queen of Tears' },
    { id: 119051, type: 'tv', title: 'Wednesday' },
    { id: 93405, type: 'tv', title: 'Squid Game' },
    { id: 1396, type: 'tv', title: 'Boys Over Flowers' },
    { id: 82057, type: 'tv', title: 'My Secret Terrius' },
    { id: 99966, type: 'tv', title: 'All of Us Are Dead' },
    { id: 209867, type: 'tv', title: 'My Demon' },
    { id: 94796, type: 'tv', title: 'Crash Landing on You' }
  ],
  chinese: [
    { id: 227871, type: 'tv', title: 'Hidden Love' },
    { id: 130368, type: 'tv', title: 'Love Between Fairy and Devil' },
    { id: 91577, type: 'tv', title: 'The Untamed' },
    { id: 112520, type: 'tv', title: 'Word of Honor' }
  ],
  turkish: [
    { id: 66017, type: 'tv', title: 'Resurrection: Ertugrul' },
    { id: 95603, type: 'tv', title: 'Kurulus: Osman' },
    { id: 104461, type: 'tv', title: 'Love is in the Air' }
  ],
  punjabi: [
    { id: 1083981, type: 'movie', title: 'Carry On Jatta 3' },
    { id: 524311, type: 'movie', title: 'Carry On Jatta 2' },
    { id: 208573, type: 'movie', title: 'Carry On Jatta' },
    { id: 208643, type: 'movie', title: 'Jatt & Juliet 2' },
    { id: 157948, type: 'movie', title: 'Jatt & Juliet' },
    { id: 781732, type: 'movie', title: 'Animal' },
    { id: 872906, type: 'movie', title: 'Jawan' },
    { id: 20453, type: 'movie', title: '3 Idiots' }
  ],
  hollywood: [
    { id: 872585, type: 'movie', title: 'Oppenheimer' },
    { id: 346698, type: 'movie', title: 'Barbie' },
    { id: 76600, type: 'movie', title: 'Avatar: The Way of Water' },
    { id: 157336, type: 'movie', title: 'Interstellar' },
    { id: 27205, type: 'movie', title: 'Inception' },
    { id: 155, type: 'movie', title: 'The Dark Knight' },
    { id: 597, type: 'movie', title: 'Titanic' }
  ]
};

// API Fetch Helper
export async function fetchMediaDetails(id, type) {
  try {
    if (typeof id === 'string' && id.startsWith('youtube-')) {
      const customMatch = CURATED_LISTS.islamic.find(v => v.id === id);
      if (customMatch) {
        return {
          id: customMatch.id,
          title: customMatch.title,
          name: customMatch.title,
          overview: customMatch.overview,
          poster_path: customMatch.poster_path,
          backdrop_path: customMatch.backdrop_path,
          vote_average: customMatch.vote_average,
          release_date: customMatch.release_date,
          runtime: customMatch.runtime,
          media_type: type,
          credits: { 
            cast: [
              { name: 'Dr. Israr Ahmed' },
              { name: 'Dr. Zakir Naik' }
            ] 
          },
          videos: { results: [] }
        };
      }
    }

    let res = await fetch(`${TMDB_CONFIG.BASE_URL}/${type}/${id}?api_key=${TMDB_CONFIG.API_KEY}&append_to_response=videos,credits,recommendations`);
    if (!res.ok) {
      console.warn(`Fallback fetch for TMDB ID: ${id}`);
      res = await fetch(`${TMDB_CONFIG.BASE_URL}/${type}/${id}?api_key=${TMDB_CONFIG.API_KEY}`);
    }
    if (!res.ok) throw new Error(`Failed to fetch tmdb id: ${id}`);
    const data = await res.json();
    return { ...data, media_type: type };
  } catch (error) {
    console.error(error);
    return null;
  }
}
