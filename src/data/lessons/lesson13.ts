import { Lesson, WordItem } from '../../types';

export const LESSON_13_INFO: Lesson = {
  number: 13,
  titleJp: "第13課 私のおすすめ",
  titleEn: "My Recommendations",
  titleBn: "লেসন ১৩: আমার সুপারিশ",
  canDo: "生活を楽しく便利にするために、身近な役立つ情報やおすすめ情報をやりとりすることができる。",
  canDoBn: "সহজ ও উপকারী তথ্য এবং সুপারিশ শেয়ার করা।",
  colorTheme: "pink"
};

export const LESSON_13_WORDS: WordItem[] = [
  // 話読聞書
  { id: "l13-1", lessonNumber: 13, japanese: "駅弁", reading: "えきべん", english: "boxed meal sold at train stations", bengali: "ট্রেন স্টেশনের লাঞ্চ বক্স (একিবেন)", category: "Food", emoji: "🍱" },
  { id: "l13-2", lessonNumber: 13, japanese: "切符", reading: "きっぷ", english: "ticket", bengali: "টিকিট", category: "Travel", emoji: "🎫" },
  { id: "l13-3", lessonNumber: 13, japanese: "特急電車", reading: "とっきゅうでんしゃ", english: "express train", bengali: "এক্সপ্রেস ট্রেন", category: "Travel", emoji: "🚆" },
  { id: "l13-4", lessonNumber: 13, japanese: "～分", reading: "～ふん", english: "counter (as in 'for 1', 'for 2')", bengali: "অংশ / জনের পরিমাণ (যেমন: ১ জনের অংশ)", category: "Quantities", emoji: "🔢" },

  // 1 経験から
  { id: "l13-5", lessonNumber: 13, japanese: "おすすめ", reading: "おすすめ", english: "recommendation", bengali: "সুপারিশ / পরামর্শ", category: "General", emoji: "👍" },
  { id: "l13-6", lessonNumber: 13, japanese: "紅葉", reading: "こうよう", english: "autumn leaves", bengali: "শরতের রঙিন পাতা / মোমিজি", category: "Nature", emoji: "🍁" },
  { id: "l13-7", lessonNumber: 13, japanese: "サービス", reading: "さーびす", english: "service", bengali: "সার্ভিস / সেবা", category: "Life", emoji: "🛎️" },
  { id: "l13-8", lessonNumber: 13, japanese: "相撲", reading: "すもう", english: "sumo", bengali: "সুমো কুস্তি", category: "Sports", emoji: "🤼" },
  { id: "l13-9", lessonNumber: 13, japanese: "ホテル", reading: "ほてる", english: "hotel", bengali: "হোটেল", category: "Travel", emoji: "🏨" },
  { id: "l13-10", lessonNumber: 13, japanese: "知ります [知る]", reading: "しります", english: "know", bengali: "জানা / চেনা", category: "Verbs", emoji: "💡" },
  { id: "l13-11", lessonNumber: 13, japanese: "デート・します [デート・する]", reading: "でーとする", english: "go on a date", bengali: "ডেটে যাওয়া", category: "Verbs", emoji: "💑" },
  { id: "l13-12", lessonNumber: 13, japanese: "１回も", reading: "いっかいも", english: "once (not even once with neg.)", bengali: "একবারও (না)", category: "Adverbs", emoji: "0️⃣" },
  { id: "l13-13", lessonNumber: 13, japanese: "何回も", reading: "なんかいも", english: "a number of times / many times", bengali: "অনেকবার / বহুবার", category: "Adverbs", emoji: "🔄" },

  // 2 おすすめします
  { id: "l13-14", lessonNumber: 13, japanese: "アプリ", reading: "あぷり", english: "app / application", bengali: "মোবাইল অ্যাপ", category: "Technology", emoji: "📱" },
  { id: "l13-15", lessonNumber: 13, japanese: "女の人", reading: "おんなのひと", english: "woman", bengali: "নারী / মহিলা", category: "People", emoji: "👩" },
  { id: "l13-16", lessonNumber: 13, japanese: "家具", reading: "かぐ", english: "furniture", bengali: "আসবাবপত্র", category: "House", emoji: "🛋️" },
  { id: "l13-17", lessonNumber: 13, japanese: "動画", reading: "どうが", english: "video", bengali: "ভিডিও", category: "Media", emoji: "🎥" },
  { id: "l13-18", lessonNumber: 13, japanese: "人気", reading: "にんき", english: "popular", bengali: "জনপ্রিয়", category: "Adjectives", emoji: "🌟" },
  { id: "l13-19", lessonNumber: 13, japanese: "お（店）", reading: "おみせ", english: "store / shop", bengali: "দোকান", category: "Places", emoji: "🏬" },
  { id: "l13-20", lessonNumber: 13, japanese: "ジェットコースター", reading: "じぇっとこーすたー", english: "roller coaster", bengali: "রোলার কোস্টার", category: "Entertainment", emoji: "🎢" },
  { id: "l13-21", lessonNumber: 13, japanese: "遊園地", reading: "ゆうえんち", english: "amusement park", bengali: "বিনোদন পার্ক / অ্যামিউজমেন্ট পার্ক", category: "Entertainment", emoji: "🎡" },
  { id: "l13-22", lessonNumber: 13, japanese: "サングラス", reading: "さんぐらす", english: "sunglasses", bengali: "সানগ্লাস", category: "Fashion", emoji: "🕶️" },
  { id: "l13-23", lessonNumber: 13, japanese: "眼鏡", reading: "めがね", english: "eyeglasses", bengali: "চশমা", category: "Fashion", emoji: "👓" },
  { id: "l13-24", lessonNumber: 13, japanese: "シャツ", reading: "しゃつ", english: "shirt", bengali: "শার্ট", category: "Clothing", emoji: "👕" },
  { id: "l13-25", lessonNumber: 13, japanese: "スカート", reading: "すかーと", english: "skirt", bengali: "স্কার্ট", category: "Clothing", emoji: "👗" },
  { id: "l13-26", lessonNumber: 13, japanese: "ネクタイ", reading: "ねくたい", english: "necktie", bengali: "টাই / নেকটাই", category: "Clothing", emoji: "👔" },
  { id: "l13-27", lessonNumber: 13, japanese: "帽子", reading: "ぼうし", english: "hat / cap", bengali: "টুপি", category: "Clothing", emoji: "🧢" },
  { id: "l13-28", lessonNumber: 13, japanese: "売ります [売る]", reading: "うります", english: "sell", bengali: "বিক্রি করা", category: "Verbs", emoji: "🏷️" },
  { id: "l13-29", lessonNumber: 13, japanese: "かぶります [かぶる]", reading: "かぶります", english: "put on / wear (hats, caps, hoods)", bengali: "টুপি পরা", category: "Verbs", emoji: "🧢" },
  { id: "l13-30", lessonNumber: 13, japanese: "泊まります [泊まる]", reading: "とまります", english: "stay over (at a hotel, etc.)", bengali: "হোটেলে থাকা / রাত কাটানো", category: "Verbs", emoji: "🏨" },
  { id: "l13-31", lessonNumber: 13, japanese: "はきます [はく]", reading: "はきます", english: "put on / wear (pants, shoes, socks)", bengali: "জুতো / প্যান্ট / মোজা পরা", category: "Verbs", emoji: "👖" },
  { id: "l13-32", lessonNumber: 13, japanese: "かけます [かける]", reading: "かけます", english: "put on / wear (glasses)", bengali: "চশমা পরা", category: "Verbs", emoji: "👓" },
  { id: "l13-33", lessonNumber: 13, japanese: "眼鏡をかけます", reading: "めがねをかけます", english: "I wear glasses.", bengali: "চশমা পরি।", category: "Phrases", emoji: "👓" },
  { id: "l13-34", lessonNumber: 13, japanese: "着ます [着る]", reading: "きます", english: "put on / wear (shirts, coats, dresses)", bengali: "পোশাক / শার্ট পরা", category: "Verbs", emoji: "🧥" },
  { id: "l13-35", lessonNumber: 13, japanese: "します [する]", reading: "します", english: "put on / wear (neckties, scarves)", bengali: "টাই / স্কার্ফ পরা", category: "Verbs", emoji: "👔" },
  { id: "l13-36", lessonNumber: 13, japanese: "ネクタイをします", reading: "ねくたいをします", english: "I wear a necktie.", bengali: "টাই পরি।", category: "Phrases", emoji: "👔" },
  { id: "l13-37", lessonNumber: 13, japanese: "紹介・します [紹介・する]", reading: "しょうかいします", english: "introduce", bengali: "পরিচয় করিয়ে দেওয়া", category: "Verbs", emoji: "🤝" },
  { id: "l13-38", lessonNumber: 13, japanese: "青い", reading: "あおい", english: "blue", bengali: "নীল", category: "Colors", emoji: "🔵" },
  { id: "l13-39", lessonNumber: 13, japanese: "赤い", reading: "あかい", english: "red", bengali: "লাল", category: "Colors", emoji: "🔴" },
  { id: "l13-40", lessonNumber: 13, japanese: "黄色い", reading: "きいろい", english: "yellow", bengali: "হলুদ", category: "Colors", emoji: "🟡" },
  { id: "l13-41", lessonNumber: 13, japanese: "若い", reading: "わかい", english: "young", bengali: "তরুণ / কমবয়সী", category: "Adjectives", emoji: "🧑" },
  { id: "l13-42", lessonNumber: 13, japanese: "新鮮（な）", reading: "しんせん（な）", english: "fresh", bengali: "তাজা / সতেজ", category: "Adjectives", emoji: "🐟" },

  // 3 教えてください
  { id: "l13-43", lessonNumber: 13, japanese: "男の人", reading: "おとこのひと", english: "man", bengali: "পুরুষ / ব্যক্তি", category: "People", emoji: "👨" },
  { id: "l13-44", lessonNumber: 13, japanese: "材料", reading: "ざいりょう", english: "ingredients", bengali: "উপকরণ / রান্নার উপাদান", category: "Food", emoji: "🥕" },
  { id: "l13-45", lessonNumber: 13, japanese: "場所", reading: "ばしょ", english: "place", bengali: "স্থান / জায়গা", category: "General", emoji: "📍" },
  { id: "l13-46", lessonNumber: 13, japanese: "バスケットボール", reading: "ばすけっとぼーる", english: "basketball", bengali: "বাস্কেটবল", category: "Sports", emoji: "🏀" },
  { id: "l13-47", lessonNumber: 13, japanese: "浴衣", reading: "ゆかた", english: "yukata (informal cotton kimono)", bengali: "ইউকাতা (জাপানি সুতি পোশাক)", category: "Clothing", emoji: "👘" },
  { id: "l13-48", lessonNumber: 13, japanese: "どこか", reading: "どこか", english: "somewhere", bengali: "কোথাও", category: "General", emoji: "🗺️" },
  { id: "l13-49", lessonNumber: 13, japanese: "練習・します [練習・する]", reading: "れんしゅうします", english: "practice", bengali: "অনুশীলন করা", category: "Verbs", emoji: "🏋️" },
  { id: "l13-50", lessonNumber: 13, japanese: "みんなで", reading: "みんなで", english: "with everyone / all together", bengali: "সবাই মিলে একসাথে", category: "Adverbs", emoji: "👥" },

  // もう一度聞こう
  { id: "l13-51", lessonNumber: 13, japanese: "毛糸", reading: "けいと", english: "wool", bengali: "পশম / উলের সুতো", category: "Material", emoji: "🧶" },
  { id: "l13-52", lessonNumber: 13, japanese: "手袋", reading: "てぶくろ", english: "gloves", bengali: "হাতমোজা / দস্তানা", category: "Clothing", emoji: "🧤" }
];
