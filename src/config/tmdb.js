// TMDB Configuration and Curated Lists for Loom Movies

export const BANNED_KEYWORDS = [
  'xxx', 'porn', 'sex', 'nude', 'hentai', 'erotic', 'adult', 'sensual', 'playboy', 'kamasutra', 'nudity', 
  'milf', 'blowjob', 'pussy', 'dick', 'cock', 'hardcore', 'softcore', 'orgasm', 'masturbate', 'naked',
  'fuck', 'asshole', 'pornstar', 'erotik'
];

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
    { id: 24428, type: 'movie', title: 'The Avengers' },
    { id: 284054, type: 'movie', title: 'Black Panther' },
    { id: 118340, type: 'movie', title: 'Guardians of the Galaxy' },
    { id: 453395, type: 'movie', title: 'Doctor Strange in the Multiverse of Madness' },
    { id: 1771, type: 'movie', title: 'Captain America: The First Avenger' },
    { id: 100402, type: 'movie', title: 'Captain America: The Winter Soldier' },
    { id: 271110, type: 'movie', title: 'Captain America: Civil War' },
    { id: 283995, type: 'movie', title: 'Guardians of the Galaxy Vol. 2' },
    { id: 447365, type: 'movie', title: 'Guardians of the Galaxy Vol. 3' },
    { id: 616037, type: 'movie', title: 'Thor: Love and Thunder' },
    { id: 284052, type: 'movie', title: 'Doctor Strange' },
    { id: 102899, type: 'movie', title: 'Ant-Man' },
    { id: 363088, type: 'movie', title: 'Ant-Man and the Wasp' },
    { id: 640146, type: 'movie', title: 'Ant-Man and the Wasp: Quantumania' },
    { id: 505537, type: 'movie', title: 'Thor: The Dark World' },
    { id: 505642, type: 'movie', title: 'Black Panther: Wakanda Forever' },
    { id: 566525, type: 'movie', title: 'Shang-Chi and the Legend of the Ten Rings' },
    { id: 10138, type: 'movie', title: 'Iron Man 2' },
    { id: 68721, type: 'movie', title: 'Iron Man 3' },
    { id: 88396, type: 'tv', title: 'The Falcon and the Winter Soldier' },
    { id: 92749, type: 'tv', title: 'Moon Knight' },
    { id: 497698, type: 'movie', title: 'Black Widow' },
    { id: 524434, type: 'movie', title: 'Eternals' },
    { id: 609681, type: 'movie', title: 'The Marvels' }
  ],
  islamic: [
    { 
      id: 'youtube-kYJvM99T73k', 
      type: 'movie', 
      title: 'Dr. Israr Ahmed - Bayan-ul-Quran (Part 1)',
      overview: 'Introduction to the Quran, Tafseer and the purpose of human creation by Dr. Israr Ahmed.',
      poster_path: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2010-01-01',
      runtime: 72,
      isCustom: true 
    },
    { 
      id: 'youtube-DOZGBeuy4nw', 
      type: 'movie', 
      title: 'Dr. Zakir Naik - Purpose of Our Life',
      overview: 'Famous public lecture and Q&A session explaining the purpose of human life in the light of the Holy Quran by Dr. Zakir Naik.',
      poster_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200',
      vote_average: 9.7,
      release_date: '2009-11-05',
      runtime: 120,
      isCustom: true 
    },
    { 
      id: 'youtube-FqG7fXgCq98', 
      type: 'movie', 
      title: 'Dr. Israr Ahmed - Real Success (Falah)',
      overview: 'A profound lecture defining true success in this life and the hereafter in the light of Surah Al-Asr by Dr. Israr Ahmed.',
      poster_path: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=1200',
      vote_average: 9.9,
      release_date: '2008-08-14',
      runtime: 65,
      isCustom: true 
    },
    { 
      id: 'youtube-9RuQMD4yYWg', 
      type: 'movie', 
      title: 'Dr. Zakir Naik - Quran & Modern Science',
      overview: 'Famous lecture highlighting the connection and harmony between scientific discoveries and Quranic revelations by Dr. Zakir Naik.',
      poster_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200',
      vote_average: 9.6,
      release_date: '2018-12-25',
      runtime: 120,
      isCustom: true 
    },
    { 
      id: 'youtube-k4T0hM6W1iU', 
      type: 'movie', 
      title: 'Dr. Israr Ahmed - Bayan-ul-Quran (Part 2)',
      overview: 'Translation and Tafseer of the Holy Quran, Part 2 (Introduction) by Dr. Israr Ahmed.',
      poster_path: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2010-01-05',
      runtime: 75,
      isCustom: true 
    },
    { 
      id: 'youtube-OB-xD67hF1M', 
      type: 'movie', 
      title: 'Maulana Tariq Jamil - Namaz Na Chorna (Never Leave Prayers)',
      overview: 'A highly emotional public speech emphasizing the critical importance of regular prayer in Islam by Maulana Tariq Jamil.',
      poster_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2019-12-18',
      runtime: 38,
      isCustom: true 
    },
    { 
      id: 'youtube-T_W24y4O8O8', 
      type: 'movie', 
      title: 'Mufti Menk - Faith Through Hardship',
      overview: 'Ramadan 2024: Boost with Mufti Menk. Emphasizing how to maintain strong faith and trust in Allah during trials and hardships.',
      poster_path: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2024-03-11',
      runtime: 25,
      isCustom: true 
    },
    { 
      id: 'youtube-l_0mD9eP8Qc', 
      type: 'movie', 
      title: 'Mufti Menk - Healing the Heart of Diseases',
      overview: 'Ramadan 2024: Practical spiritual advice on overcoming negative traits, anxiety, and spiritual diseases of the heart by Mufti Menk.',
      poster_path: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2024-03-12',
      runtime: 28,
      isCustom: true 
    },
    { 
      id: 'youtube-uK1l0X1C47c', 
      type: 'movie', 
      title: 'Mufti Menk - Haters & Jealousy',
      overview: 'Dealing with Difficulty Series: Episode 18. Mufti Menk explains how to respond to haters, negativity, and jealousy.',
      poster_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200',
      vote_average: 9.7,
      release_date: '2024-03-28',
      runtime: 30,
      isCustom: true 
    },
    { 
      id: 'youtube-W0nL9tF7VzU', 
      type: 'movie', 
      title: 'Mufti Menk - Haraam Relationships',
      overview: 'Dealing with Difficulty Series: Episode 23. Moving away from harmful relationships and finding spiritual strength.',
      poster_path: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2024-04-02',
      runtime: 27,
      isCustom: true 
    },
    { 
      id: 'youtube-mD0lD5o9VvE', 
      type: 'movie', 
      title: 'Mufti Menk - Time Management',
      overview: 'Dealing with Difficulty Series: Episode 26. Practical guidance and tips on managing time productively from an Islamic perspective.',
      poster_path: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
      vote_average: 9.7,
      release_date: '2024-04-05',
      runtime: 24,
      isCustom: true 
    },
    { 
      id: 'youtube-hB9iV_h_o-0', 
      type: 'movie', 
      title: 'Mufti Menk - Sin of Comparison',
      overview: 'Dealing with Difficulty Series: Episode 24. Addressing the modern trap of comparing our lives to others on social media.',
      poster_path: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500',
      backdrop_path: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200',
      vote_average: 9.8,
      release_date: '2024-04-03',
      runtime: 26,
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
    { id: 94605, type: 'tv', title: 'Demon Slayer: Kimetsu no Yaiba' },
    { id: 129, type: 'movie', title: 'Spirited Away' },
    { id: 46298, type: 'tv', title: 'Hunter x Hunter' },
    { id: 63926, type: 'tv', title: 'One Punch Man' },
    { id: 8392, type: 'movie', title: 'My Neighbor Totoro' },
    { id: 4935, type: 'movie', title: 'Howl\'s Moving Castle' },
    { id: 128, type: 'movie', title: 'Princess Mononoke' },
    { id: 378064, type: 'movie', title: 'A Silent Voice' },
    { id: 31964, type: 'tv', title: 'Fullmetal Alchemist: Brotherhood' },
    { id: 30913, type: 'tv', title: 'Steins;Gate' },
    { id: 216393, type: 'tv', title: 'Demon Slayer: Hashira Training Arc' },
    { id: 83095, type: 'tv', title: 'Vinland Saga' },
    { id: 105248, type: 'tv', title: 'Cyberpunk: Edgerunners' },
    { id: 209867, type: 'tv', title: 'Frieren: Beyond Journey\'s End' },
    { id: 30991, type: 'tv', title: 'Cowboy Bebop' },
    { id: 67026, type: 'tv', title: 'Mob Psycho 100' },
    { id: 61223, type: 'tv', title: 'Tokyo Ghoul' },
    { id: 207361, type: 'tv', title: 'Bleach: Thousand-Year Blood War' },
    { id: 60625, type: 'tv', title: 'Haikyu!!' },
    { id: 211514, type: 'tv', title: 'Solo Leveling' },
    { id: 216172, type: 'tv', title: 'Kaiju No. 8' },
    { id: 72813, type: 'tv', title: 'Classroom of the Elite' },
    { id: 33403, type: 'tv', title: 'Monster' },
    { id: 61661, type: 'tv', title: 'Your Lie in April' },
    { id: 10603, type: 'tv', title: 'Code Geass: Lelouch of the Rebellion' },
    { id: 890, type: 'tv', title: 'Neon Genesis Evangelion' }
  ],
  kdrama: [
    { id: 203870, type: 'tv', title: 'Queen of Tears' },
    { id: 119051, type: 'tv', title: 'Wednesday' },
    { id: 93405, type: 'tv', title: 'Squid Game' },
    { id: 1396, type: 'tv', title: 'Boys Over Flowers' },
    { id: 82057, type: 'tv', title: 'My Secret Terrius' },
    { id: 99966, type: 'tv', title: 'All of Us Are Dead' },
    { id: 218539, type: 'tv', title: 'My Demon' },
    { id: 94796, type: 'tv', title: 'Crash Landing on You' },
    { id: 154825, type: 'tv', title: 'Business Proposal' },
    { id: 65143, type: 'tv', title: 'Descendants of the Sun' },
    { id: 110673, type: 'tv', title: 'Vincenzo' },
    { id: 213303, type: 'tv', title: 'Crash Course in Romance' },
    { id: 90447, type: 'tv', title: 'Hotel Del Luna' },
    { id: 101905, type: 'tv', title: 'It\'s Okay to Not Be Okay' },
    { id: 80004, type: 'tv', title: 'What\'s Wrong with Secretary Kim' },
    { id: 70335, type: 'tv', title: 'Strong Woman Do Bong-soon' },
    { id: 93846, type: 'tv', title: 'The King: Eternal Monarch' },
    { id: 61852, type: 'tv', title: 'Healer' },
    { id: 66904, type: 'tv', title: 'W: Two Worlds Apart' },
    { id: 69061, type: 'tv', title: 'Guardian: The Lonely and Great God' },
    { id: 68688, type: 'tv', title: 'Legend of the Blue Sea' },
    { id: 72911, type: 'tv', title: 'While You Were Sleeping' },
    { id: 68603, type: 'tv', title: 'Weightlifting Fairy Kim Bok-joo' },
    { id: 111119, type: 'tv', title: 'True Beauty' },
    { id: 206584, type: 'tv', title: 'The Glory' },
    { id: 96648, type: 'tv', title: 'Sweet Home' },
    { id: 129478, type: 'tv', title: 'Hometown Cha-Cha-Cha' },
    { id: 214068, type: 'tv', title: 'Strong Girl Nam-soon' },
    { id: 153870, type: 'tv', title: 'Twenty-Five Twenty-One' },
    { id: 96162, type: 'tv', title: 'Itaewon Class' },
    { id: 100185, type: 'tv', title: 'Hospital Playlist' },
    { id: 242875, type: 'tv', title: 'A Shop for Killers' },
    { id: 215093, type: 'tv', title: 'Gyeongseong Creature' },
    { id: 231267, type: 'tv', title: 'Death\'s Game' },
    { id: 200742, type: 'tv', title: 'Extraordinary Attorney Woo' }
  ],
  chinese: [
    { id: 227871, type: 'tv', title: 'Hidden Love' },
    { id: 130368, type: 'tv', title: 'Love Between Fairy and Devil' },
    { id: 91577, type: 'tv', title: 'The Untamed' },
    { id: 112520, type: 'tv', title: 'Word of Honor' },
    { id: 79818, type: 'tv', title: 'Meteor Garden' },
    { id: 92657, type: 'tv', title: 'Go Go Squid!' },
    { id: 92131, type: 'tv', title: 'The King\'s Avatar' },
    { id: 129064, type: 'tv', title: 'You Are My Glory' },
    { id: 88716, type: 'tv', title: 'Put Your Head on My Shoulder' },
    { id: 74900, type: 'tv', title: 'A Love So Beautiful' },
    { id: 81373, type: 'tv', title: 'Ashes of Love' },
    { id: 70878, type: 'tv', title: 'Eternal Love' },
    { id: 137206, type: 'tv', title: 'Till The End Of The Moon' },
    { id: 134331, type: 'tv', title: 'Lighter and Princess' },
    { id: 216503, type: 'tv', title: 'Meet Yourself' },
    { id: 126435, type: 'tv', title: 'Falling Into Your Smile' },
    { id: 226871, type: 'tv', title: 'When I Fly Towards You' },
    { id: 235650, type: 'tv', title: 'Only for Love' }
  ],
  turkish: [
    { id: 66017, type: 'tv', title: 'Resurrection: Ertugrul' },
    { id: 95603, type: 'tv', title: 'Kurulus: Osman' },
    { id: 104461, type: 'tv', title: 'Love is in the Air' },
    { id: 34899, type: 'tv', title: 'Magnificent Century' },
    { id: 79026, type: 'tv', title: 'The Protector' },
    { id: 60929, type: 'tv', title: 'Black Money Love' },
    { id: 65555, type: 'tv', title: 'Endless Love' },
    { id: 73375, type: 'tv', title: 'The Pit' },
    { id: 209265, type: 'tv', title: 'Golden Boy' },
    { id: 138171, type: 'tv', title: 'Alparslan: Great Seljuk' },
    { id: 227448, type: 'tv', title: 'The Tailor' },
    { id: 67527, type: 'tv', title: 'Ask Laftan Anlamaz' },
    { id: 88118, type: 'tv', title: 'Hercai' },
    { id: 80540, type: 'tv', title: 'Erkenci Kus' },
    { id: 96347, type: 'tv', title: 'Ramo' },
    { id: 221374, type: 'tv', title: 'Adim Farah' },
    { id: 218151, type: 'tv', title: 'Aile' },
    { id: 133726, type: 'tv', title: 'Yargi' },
    { id: 212558, type: 'tv', title: 'Sahmaran' }
  ],
  punjabi: [
    { id: 1083981, type: 'movie', title: 'Carry On Jatta 3' },
    { id: 524311, type: 'movie', title: 'Carry On Jatta 2' },
    { id: 208573, type: 'movie', title: 'Carry On Jatta' },
    { id: 208643, type: 'movie', title: 'Jatt & Juliet 2' },
    { id: 157948, type: 'movie', title: 'Jatt & Juliet' },
    { id: 781732, type: 'movie', title: 'Animal' },
    { id: 872906, type: 'movie', title: 'Jawan' },
    { id: 20453, type: 'movie', title: '3 Idiots' },
    { id: 1266014, type: 'movie', title: 'Jatt & Juliet 3' },
    { id: 884434, type: 'movie', title: 'Pathaan' },
    { id: 360814, type: 'movie', title: 'Dangal' },
    { id: 626392, type: 'movie', title: 'Laal Singh Chaddha' },
    { id: 367551, type: 'movie', title: 'Dilwale' },
    { id: 198287, type: 'movie', title: 'Chennai Express' },
    { id: 554585, type: 'movie', title: 'Kabir Singh' },
    { id: 690957, type: 'movie', title: 'Pushpa: The Rise' },
    { id: 587412, type: 'movie', title: 'K.G.F: Chapter 2' },
    { id: 579974, type: 'movie', title: 'RRR' },
    { id: 308639, type: 'movie', title: 'Baahubali: The Beginning' },
    { id: 350312, type: 'movie', title: 'Baahubali 2: The Conclusion' },
    { id: 858017, type: 'movie', title: 'Kalki 2898-AD' },
    { id: 802219, type: 'movie', title: 'Fighter' },
    { id: 753232, type: 'movie', title: 'Tiger 3' },
    { id: 873256, type: 'movie', title: 'Dunki' },
    { id: 897087, type: 'movie', title: 'Salaar: Part 1 - Ceasefire' },
    { id: 961261, type: 'movie', title: 'Leo' },
    { id: 1008005, type: 'movie', title: 'Gadar 2' },
    { id: 1102919, type: 'movie', title: 'OMG 2' },
    { id: 948333, type: 'movie', title: 'Dream Girl 2' },
    { id: 882569, type: 'movie', title: 'Rocky Aur Rani Kii Prem Kahaani' },
    { id: 1048300, type: 'movie', title: 'Tu Jhoothi Main Makkaar' },
    { id: 638545, type: 'movie', title: 'Bhool Bhulaiyaa 2' },
    { id: 680858, type: 'movie', title: 'Shershaah' },
    { id: 496335, type: 'movie', title: 'Brahmastra Part One: Shiva' },
    { id: 951556, type: 'movie', title: 'Pushpa 2: The Rule' },
    { id: 987915, type: 'movie', title: 'Singham Again' },
    { id: 1111977, type: 'movie', title: 'Stree 2' }
  ],
  hollywood: [
    { id: 872585, type: 'movie', title: 'Oppenheimer' },
    { id: 346698, type: 'movie', title: 'Barbie' },
    { id: 76600, type: 'movie', title: 'Avatar: The Way of Water' },
    { id: 157336, type: 'movie', title: 'Interstellar' },
    { id: 27205, type: 'movie', title: 'Inception' },
    { id: 155, type: 'movie', title: 'The Dark Knight' },
    { id: 597, type: 'movie', title: 'Titanic' },
    { id: 19995, type: 'movie', title: 'Avatar' },
    { id: 603, type: 'movie', title: 'The Matrix' },
    { id: 98, type: 'movie', title: 'Gladiator' },
    { id: 120, type: 'movie', title: 'The Lord of the Rings: The Fellowship of the Ring' },
    { id: 569094, type: 'movie', title: 'Spider-Man: Across the Spider-Verse' },
    { id: 49026, type: 'movie', title: 'The Dark Knight Rises' },
    { id: 122, type: 'movie', title: 'The Lord of the Rings: The Return of the King' },
    { id: 121, type: 'movie', title: 'The Lord of the Rings: The Two Towers' },
    { id: 693134, type: 'movie', title: 'Dune: Part Two' },
    { id: 361743, type: 'movie', title: 'Top Gun: Maverick' },
    { id: 680, type: 'movie', title: 'Pulp Fiction' },
    { id: 550, type: 'movie', title: 'Fight Club' },
    { id: 13, type: 'movie', title: 'Forrest Gump' },
    { id: 278, type: 'movie', title: 'The Shawshank Redemption' },
    { id: 238, type: 'movie', title: 'The Godfather' },
    { id: 558449, type: 'movie', title: 'Gladiator II' },
    { id: 589761, type: 'movie', title: 'Dune' },
    { id: 106646, type: 'movie', title: 'The Wolf of Wall Street' },
    { id: 240, type: 'movie', title: 'The Godfather Part II' },
    { id: 769, type: 'movie', title: 'GoodFellas' },
    { id: 807, type: 'movie', title: 'Se7en' },
    { id: 274, type: 'movie', title: 'The Silence of the Lambs' },
    { id: 857, type: 'movie', title: 'Saving Private Ryan' },
    { id: 424, type: 'movie', title: 'Schindler\'s List' },
    { id: 497, type: 'movie', title: 'The Green Mile' },
    { id: 1124, type: 'movie', title: 'The Prestige' },
    { id: 244786, type: 'movie', title: 'Whiplash' },
    { id: 68718, type: 'movie', title: 'Django Unchained' },
    { id: 496243, type: 'movie', title: 'Parasite' },
    { id: 945961, type: 'movie', title: 'Alien: Romulus' }
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

export async function fetchMediaDetailsLight(id, type) {
  try {
    if (typeof id === 'string' && id.startsWith('youtube-')) {
      return fetchMediaDetails(id, type);
    }
    const res = await fetch(`${TMDB_CONFIG.BASE_URL}/${type}/${id}?api_key=${TMDB_CONFIG.API_KEY}`);
    if (!res.ok) throw new Error(`Failed to fetch light details for tmdb id: ${id}`);
    const data = await res.json();
    return { ...data, media_type: type };
  } catch (error) {
    console.error(error);
    return null;
  }
}
