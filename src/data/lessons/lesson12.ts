import { Lesson, WordItem } from '../../types';

export const LESSON_12_INFO: Lesson = {
  number: 12,
  titleJp: "第12課 病気・けが",
  titleEn: "Illness & Injury",
  titleBn: "লেসন ১২: অসুস্থতা ও আঘাত",
  canDo: "体調について友達や周りの人と簡単に話すことができる。また、病院で簡単なやりとりをすることができる。",
  canDoBn: "শারীরিক অবস্থা নিয়ে কথা বলা এবং হাসপাতালে সাধারণ কথোপকথন করা।",
  colorTheme: "pink"
};

export const LESSON_12_WORDS: WordItem[] = [
  // 話読聞書
  { id: "l12-1", lessonNumber: 12, japanese: "キャベツ", reading: "きゃべつ", english: "cabbage", bengali: "বাঁধাকপি", category: "Food", emoji: "🥬" },
  { id: "l12-2", lessonNumber: 12, japanese: "材料", reading: "ざいりょう", english: "ingredients", bengali: "উপকরণ / রান্নার উপাদান", category: "Food", emoji: "🥕" },
  { id: "l12-3", lessonNumber: 12, japanese: "ジューサー", reading: "じゅーさー", english: "juicer", bengali: "জুসার", category: "Appliances", emoji: "🍹" },
  { id: "l12-4", lessonNumber: 12, japanese: "トマト", reading: "とまと", english: "tomato", bengali: "টমেটো", category: "Food", emoji: "🍅" },
  { id: "l12-5", lessonNumber: 12, japanese: "ニンジン", reading: "にんじん", english: "carrot", bengali: "গাজর", category: "Food", emoji: "🥕" },

  // 1 体の調子
  { id: "l12-6", lessonNumber: 12, japanese: "けが", reading: "けが", english: "injury", bengali: "আঘাত / চোট", category: "Health", emoji: "🩹" },
  { id: "l12-7", lessonNumber: 12, japanese: "食欲", reading: "しょくよく", english: "appetite", bengali: "ক্ষুধা / খাওয়ার রুচি", category: "Health", emoji: "🍽️" },
  { id: "l12-8", lessonNumber: 12, japanese: "調子", reading: "ちょうし", english: "condition / state", bengali: "অবস্থা / শারীরিক অবস্থা", category: "Health", emoji: "🩺" },
  { id: "l12-9", lessonNumber: 12, japanese: "熱", reading: "ねつ", english: "fever", bengali: "জ্বর", category: "Health", emoji: "🤒" },
  { id: "l12-10", lessonNumber: 12, japanese: "病気", reading: "びょうき", english: "illness", bengali: "অসুস্থতা / রোগ", category: "Health", emoji: "🏥" },
  { id: "l12-11", lessonNumber: 12, japanese: "のど", reading: "のど", english: "throat", bengali: "গলা", category: "Body", emoji: "🗣️" },
  { id: "l12-12", lessonNumber: 12, japanese: "歯", reading: "は", english: "tooth / teeth", bengali: "দাঁত", category: "Body", emoji: "🦷" },
  { id: "l12-13", lessonNumber: 12, japanese: "飲み会", reading: "のみかい", english: "drinking party", bengali: "আড্ডা বা মদ্যপানের অনুষ্ঠান", category: "Social", emoji: "🍻" },
  { id: "l12-14", lessonNumber: 12, japanese: "～度", reading: "～ど", english: "degrees", bengali: "ডিগ্রি (তাপমাত্রা)", category: "Units", emoji: "🌡️" },
  { id: "l12-15", lessonNumber: 12, japanese: "治ります [治る]", reading: "なおります", english: "cure / heal", bengali: "সেরে ওঠা / নিরাময় হওয়া", category: "Verbs", emoji: "🩹" },
  { id: "l12-16", lessonNumber: 12, japanese: "休みます [休む]", reading: "やすみます", english: "rest / off / absent", bengali: "বিশ্রাম নেওয়া / ছুটি নেওয়া / অনুপস্থিত থাকা", category: "Verbs", emoji: "🛌" },
  { id: "l12-17", lessonNumber: 12, japanese: "学校を休みます", reading: "がっこうをやすみます", english: "I'll be absent from school today.", bengali: "আজ স্কুল ছুটি নেব।", category: "Phrases", emoji: "🏫" },
  { id: "l12-18", lessonNumber: 12, japanese: "悪い", reading: "わるい", english: "bad", bengali: "খারাপ", category: "Adjectives", emoji: "👎" },
  { id: "l12-19", lessonNumber: 12, japanese: "気持ちが悪い", reading: "きもちがわるい", english: "feel bad / ill", bengali: "অসুস্থ বা বমি বমি ভাব লাগা", category: "Health", emoji: "🤢" },
  { id: "l12-20", lessonNumber: 12, japanese: "大丈夫（な）", reading: "だいじょうぶ（な）", english: "OK / alright", bengali: "ঠিক আছে / সমস্যা নেই", category: "Adjectives", emoji: "👌" },
  { id: "l12-21", lessonNumber: 12, japanese: "早く", reading: "はやく", english: "fast / quickly / early", bengali: "দ্রুত / তাড়াতাড়ি", category: "Adverbs", emoji: "⚡" },
  { id: "l12-22", lessonNumber: 12, japanese: "おかげさまで", reading: "おかげさまで", english: "With your help! / Thanks to you!", bengali: "আপনার দোয়ায় / ধন্যবাদ!", category: "Expressions", emoji: "🙏" },
  { id: "l12-23", lessonNumber: 12, japanese: "お大事に", reading: "おだいじに", english: "Please take care.", bengali: "নিজের যত্ন নেবেন / দ্রুত সুস্থ হন।", category: "Expressions", emoji: "💐" },
  { id: "l12-24", lessonNumber: 12, japanese: "それはいけませんね", reading: "それはいけませんね", english: "That won't do. / That's too bad.", bengali: "এটা তো ভালো কথা নয় / খুব খারাপ হলো।", category: "Expressions", emoji: "😔" },

  // 2 アドバイス
  { id: "l12-25", lessonNumber: 12, japanese: "体", reading: "からだ", english: "body", bengali: "শরীর / দেহ", category: "Body", emoji: "🧍" },
  { id: "l12-26", lessonNumber: 12, japanese: "シャワー", reading: "しゃわー", english: "shower", bengali: "শাওয়ার / গোসল", category: "Daily", emoji: "🚿" },
  { id: "l12-27", lessonNumber: 12, japanese: "睡眠", reading: "すいみん", english: "sleep", bengali: "ঘুম", category: "Health", emoji: "😴" },
  { id: "l12-28", lessonNumber: 12, japanese: "歯医者", reading: "はいしゃ", english: "dentist", bengali: "দন্তচিকিৎসক", category: "Jobs", emoji: "🦷" },
  { id: "l12-29", lessonNumber: 12, japanese: "虫歯", reading: "むしば", english: "(tooth) cavity", bengali: "দাঁতের পোকা / ক্যাভিটি", category: "Health", emoji: "🦷" },
  { id: "l12-30", lessonNumber: 12, japanese: "やけど", reading: "やけど", english: "burn", bengali: "পুড়ে যাওয়া", category: "Health", emoji: "🔥" },
  { id: "l12-31", lessonNumber: 12, japanese: "こと", reading: "こと", english: "something (that is done) / matter", bengali: "বিষয় / কাজ", category: "General", emoji: "📌" },
  { id: "l12-32", lessonNumber: 12, japanese: "物", reading: "もの", english: "thing / something", bengali: "জিনিস / বস্তু", category: "General", emoji: "📦" },
  { id: "l12-33", lessonNumber: 12, japanese: "～以上", reading: "～いじょう", english: "~ or more / more than", bengali: "বা তার বেশি", category: "Quantities", emoji: "🔢" },
  { id: "l12-34", lessonNumber: 12, japanese: "出します [出す]", reading: "だします", english: "let out", bengali: "বের করা / আওয়াজ করা", category: "Verbs", emoji: "📢" },
  { id: "l12-35", lessonNumber: 12, japanese: "声を出します", reading: "こえをだします", english: "call out / speak up", bengali: "আওয়াজ বের করা / কথা বলা", category: "Phrases", emoji: "🗣️" },
  { id: "l12-36", lessonNumber: 12, japanese: "塗ります [塗る]", reading: "ぬります", english: "paint / apply ointment", bengali: "ওষুধ বা মলম লাগানো", category: "Verbs", emoji: "🧴" },
  { id: "l12-37", lessonNumber: 12, japanese: "浴びます [浴びる]", reading: "あびます", english: "splash / pour over (take a shower)", bengali: "গোসল করা / শাওয়ার নেওয়া", category: "Verbs", emoji: "🚿" },
  { id: "l12-38", lessonNumber: 12, japanese: "出かけます [出かける]", reading: "でかけます", english: "go out", bengali: "বাইরে যাওয়া", category: "Verbs", emoji: "🚪" },
  { id: "l12-39", lessonNumber: 12, japanese: "運動・します [運動・する]", reading: "うんどうします", english: "exercise", bengali: "ব্যায়াম করা", category: "Verbs", emoji: "🏃" },
  { id: "l12-40", lessonNumber: 12, japanese: "固い", reading: "かたい", english: "hard", bengali: "শক্ত", category: "Adjectives", emoji: "🪨" },
  { id: "l12-41", lessonNumber: 12, japanese: "柔らかい", reading: "やわらかい", english: "soft", bengali: "নরম", category: "Adjectives", emoji: "🍞" },
  { id: "l12-42", lessonNumber: 12, japanese: "体にいい", reading: "からだにいい", english: "good for the body / healthy", bengali: "শরীরের জন্য ভালো / পুষ্টিকর", category: "Health", emoji: "🥗" },
  { id: "l12-43", lessonNumber: 12, japanese: "自分で", reading: "じぶんで", english: "by oneself", bengali: "নিজে নিজে", category: "Adverbs", emoji: "👤" },
  { id: "l12-44", lessonNumber: 12, japanese: "できるだけ", reading: "できるだけ", english: "as much as possible", bengali: "যতদূর সম্ভব", category: "Adverbs", emoji: "🎯" },
  { id: "l12-45", lessonNumber: 12, japanese: "ゆっくり", reading: "ゆっくり", english: "leisurely / slowly", bengali: "ধীরে ধীরে / আরাম করে", category: "Adverbs", emoji: "☕" },
  { id: "l12-46", lessonNumber: 12, japanese: "ゆっくり休んでください", reading: "ゆっくりやすんでください", english: "Please take a good rest.", bengali: "ভালোভাবে বিশ্রাম নিন।", category: "Phrases", emoji: "🛌" },

  // 3 病院で
  { id: "l12-47", lessonNumber: 12, japanese: "薬剤師", reading: "やくざいし", english: "pharmacist", bengali: "ফার্মাসিস্ট / ওষুধ বিক্রেতা", category: "Jobs", emoji: "💊" },
  { id: "l12-48", lessonNumber: 12, japanese: "上着", reading: "うわぎ", english: "coat / jacket", bengali: "জ্যাকেট / উপরের জামা", category: "Clothing", emoji: "🧥" },
  { id: "l12-49", lessonNumber: 12, japanese: "コンタクトレンズ（コンタクト）", reading: "こんたくとれんず", english: "contact lenses", bengali: "কন্টাক্ট লেন্স", category: "Objects", emoji: "👁️" },
  { id: "l12-50", lessonNumber: 12, japanese: "説明書", reading: "せつめいしょ", english: "directions / user guide", bengali: "নির্দেশিকা পুস্তিকা", category: "Books", emoji: "📄" },
  { id: "l12-51", lessonNumber: 12, japanese: "お風呂", reading: "おふろ", english: "bath", bengali: "গোসলের বাথটাব / স্নান", category: "Daily", emoji: "🛁" },
  { id: "l12-52", lessonNumber: 12, japanese: "保険証", reading: "ほけんしょう", english: "insurance card", bengali: "স্বাস্থ্যবীমা কার্ড", category: "Documents", emoji: "💳" },
  { id: "l12-53", lessonNumber: 12, japanese: "待合室", reading: "まちあいしつ", english: "waiting room", bengali: "অপেক্ষাগার", category: "Places", emoji: "🛋️" },
  { id: "l12-54", lessonNumber: 12, japanese: "薬局", reading: "やっきょく", english: "pharmacy", bengali: "ওষুধের দোকান / ফার্মেসি", category: "Places", emoji: "💊" },
  { id: "l12-55", lessonNumber: 12, japanese: "出します [出す]", reading: "だします", english: "take out / show / hand over", bengali: "বের করে দেখানো / জমা দেওয়া", category: "Verbs", emoji: "📤" },
  { id: "l12-56", lessonNumber: 12, japanese: "保険証を出してください", reading: "ほけんしょうをだしてください", english: "May I please see your insurance card?", bengali: "আপনার স্বাস্থ্যবীমা কার্ডটি দিন।", category: "Phrases", emoji: "💳" },
  { id: "l12-57", lessonNumber: 12, japanese: "脱ぎます [脱ぐ]", reading: "ぬぎます", english: "remove / take off (clothes, shoes)", bengali: "পোশাক বা জুতো খোলা", category: "Verbs", emoji: "👟" },
  { id: "l12-58", lessonNumber: 12, japanese: "走ります [走る]", reading: "はしります", english: "run", bengali: "দৌড়ানো", category: "Verbs", emoji: "🏃" },
  { id: "l12-59", lessonNumber: 12, japanese: "磨きます [磨く]", reading: "みがきます", english: "brush / polish", bengali: "দাঁত মাজা / ব্রাশ করা", category: "Verbs", emoji: "🪥" },
  { id: "l12-60", lessonNumber: 12, japanese: "横になります [横になる]", reading: "よこになります", english: "lay down", bengali: "শুয়ে পড়া / একটু শোয়া", category: "Verbs", emoji: "🛏️" },
  { id: "l12-61", lessonNumber: 12, japanese: "準備・します [準備・する]", reading: "じゅんびします", english: "prepare", bengali: "প্রস্তুতি নেওয়া", category: "Verbs", emoji: "📋" },
  { id: "l12-62", lessonNumber: 12, japanese: "かゆい", reading: "かゆい", english: "itchy", bengali: "চুলকায় এমন / চুলকানিযুক্ত", category: "Adjectives", emoji: "😣" },

  // もう一度聞こう
  { id: "l12-63", lessonNumber: 12, japanese: "口", reading: "くち", english: "mouth", bengali: "মুখ", category: "Body", emoji: "👄" },
  { id: "l12-64", lessonNumber: 12, japanese: "処方箋", reading: "しょほうせん", english: "prescription", bengali: "প্রেসক্রিপশন / চিকিৎসকের ব্যবস্থাপত্র", category: "Health", emoji: "📝" },
  { id: "l12-65", lessonNumber: 12, japanese: "赤い", reading: "あかい", english: "red", bengali: "লাল", category: "Colors", emoji: "🔴" }
];
