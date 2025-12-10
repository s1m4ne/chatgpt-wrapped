import TinySegmenter from 'tiny-segmenter'
import type {
  Conversation,
  BasicStats,
  ActivityPattern,
  MonthlyCount,
  WeekdayCount,
  YearlyHeatmap,
  InsightsStats,
  WordFrequency,
  QuestionStats,
  QuestionPattern,
  MVPConversation,
  BehaviorStats,
  HourlyHeatmapData,
  CatchPhrase,
  GratitudeStats,
  ConfusionStats,
  PhraseUsage,
  GratitudeVariation,
  ConfusionPattern,
  NgramStats,
  NgramPhrase,
} from '../types'

const segmenter = new TinySegmenter()

const CHARS_PER_TOKEN = 4 // Approximate

export function calculateBasicStats(conversations: Conversation[]): BasicStats {
  let totalMessages = 0
  let userMessages = 0
  let assistantMessages = 0
  let totalChars = 0
  const activeDates = new Set<string>()

  let minDate: Date | null = null
  let maxDate: Date | null = null

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      totalMessages++
      totalChars += msg.content.length

      if (msg.role === 'user') {
        userMessages++
      } else if (msg.role === 'assistant') {
        assistantMessages++
      }

      if (msg.createTime) {
        const dateStr = msg.createTime.toISOString().split('T')[0]
        activeDates.add(dateStr)

        if (!minDate || msg.createTime < minDate) {
          minDate = msg.createTime
        }
        if (!maxDate || msg.createTime > maxDate) {
          maxDate = msg.createTime
        }
      }
    }

    // Also use conversation create time
    const convDateStr = conv.createTime.toISOString().split('T')[0]
    activeDates.add(convDateStr)

    if (!minDate || conv.createTime < minDate) {
      minDate = conv.createTime
    }
    if (!maxDate || conv.createTime > maxDate) {
      maxDate = conv.createTime
    }
  }

  const longestStreak = calculateLongestStreak(activeDates)
  const estimatedTokens = Math.round(totalChars / CHARS_PER_TOKEN)

  return {
    totalConversations: conversations.length,
    totalMessages,
    userMessages,
    assistantMessages,
    estimatedTokens,
    activeDays: activeDates.size,
    longestStreak,
    dateRange: {
      start: minDate || new Date(),
      end: maxDate || new Date(),
    },
  }
}

function calculateLongestStreak(activeDates: Set<string>): number {
  if (activeDates.size === 0) return 0

  const sortedDates = Array.from(activeDates).sort()
  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

export function calculateActivityPattern(conversations: Conversation[]): ActivityPattern {
  // 7x24 matrix: [day of week][hour]
  const hourlyHeatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  const monthlyMap = new Map<string, number>()
  const weekdayCounts: number[] = Array(7).fill(0)
  // Year -> date -> count
  const yearlyDailyMap = new Map<number, Map<string, number>>()

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      const date = msg.createTime || conv.createTime
      const dayOfWeek = date.getDay() // 0 = Sunday
      const hour = date.getHours()
      const year = date.getFullYear()
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const dateKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      hourlyHeatmap[dayOfWeek][hour]++
      weekdayCounts[dayOfWeek]++
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1)

      // Track daily counts per year
      if (!yearlyDailyMap.has(year)) {
        yearlyDailyMap.set(year, new Map())
      }
      const dailyMap = yearlyDailyMap.get(year)!
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1)
    }
  }

  const monthlyMessages: MonthlyCount[] = Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  const weekdayDistribution: WeekdayCount[] = dayNames.map((day, index) => ({
    day,
    dayIndex: index,
    count: weekdayCounts[index],
  }))

  // Convert yearly daily map to YearlyHeatmap array
  const yearlyHeatmaps: YearlyHeatmap[] = Array.from(yearlyDailyMap.entries())
    .map(([year, dailyMap]) => ({
      year,
      dailyCounts: Object.fromEntries(dailyMap),
    }))
    .sort((a, b) => b.year - a.year) // Most recent year first

  return {
    hourlyHeatmap,
    monthlyMessages,
    weekdayDistribution,
    yearlyHeatmaps,
  }
}

// Stop words to exclude from word frequency analysis
const STOP_WORDS = new Set([
  'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
  'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や',
  'れる', 'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう',
  'また', 'もの', 'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か',
  'だ', 'これ', 'によって', 'により', 'おり', 'より', 'による', 'ず', 'なり',
  'られる', 'において', 'ば', 'なかっ', 'なく', 'しかし', 'について', 'せ',
  'だっ', 'その他', 'できる', 'それ', 'う', 'ので', 'なお', 'のみ', 'でき',
  'き', 'つ', 'における', 'および', 'いう', 'さらに', 'でも', 'ら', 'たり',
  'その後', 'ただし', 'かつて', 'それぞれ', 'または', 'お', 'ほど', 'ものの',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'that', 'this',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
  'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
  'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'any', 'some', 'no', 'if', 'then', 'else',
])

export function calculateInsightsStats(conversations: Conversation[]): InsightsStats {
  const frequentWords = calculateWordFrequency(conversations)
  const questionStats = calculateQuestionStats(conversations)
  const mvpConversations = findMVPConversations(conversations)
  const firstConversations = findFirstConversations(conversations)

  return {
    frequentWords,
    questionStats,
    mvpConversations,
    firstConversations,
  }
}

function calculateWordFrequency(conversations: Conversation[]): WordFrequency[] {
  const wordData = new Map<
    string,
    {
      count: number
      usages: { conversationId: string; conversationTitle: string; messageContent: string; createTime: Date }[]
    }
  >()

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role !== 'user') continue

      // Use TinySegmenter for Japanese text tokenization
      const segments = segmenter.segment(msg.content)
      const wordsInMessage = new Set<string>()

      for (const segment of segments) {
        const word = segment.toLowerCase().trim()

        // Filter out stop words, short words, numbers, and punctuation
        if (word.length < 2) continue
        if (STOP_WORDS.has(word)) continue
        if (/^\d+$/.test(word)) continue
        if (/^[a-z]$/.test(word)) continue
        // Skip punctuation and symbols
        if (/^[。、！？「」『』（）\[\]【】・…―～：；""''.,!?;:'"()\[\]{}\s]+$/.test(word)) continue
        // Skip single hiragana/katakana (particles like は、が、を)
        if (/^[\u3040-\u309F]$/.test(word)) continue

        wordsInMessage.add(word)

        if (!wordData.has(word)) {
          wordData.set(word, { count: 0, usages: [] })
        }
        wordData.get(word)!.count++
      }

      // Add usage info for each unique word in this message (limit to 10 usages per word)
      for (const word of wordsInMessage) {
        const data = wordData.get(word)!
        if (data.usages.length < 10) {
          data.usages.push({
            conversationId: conv.id,
            conversationTitle: conv.title || '無題の会話',
            messageContent: msg.content,
            createTime: msg.createTime || conv.createTime,
          })
        }
      }
    }
  }

  // Sort by count and take top 30
  return Array.from(wordData.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      usages: data.usages,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
}

function calculateQuestionStats(conversations: Conversation[]): QuestionStats {
  let totalUserMessages = 0
  let totalQuestions = 0

  const patternCounts: Record<string, { count: number; examples: string[] }> = {
    '？や?を含む質問': { count: 0, examples: [] },
    '「教えて」系': { count: 0, examples: [] },
    '「どうすれば」系': { count: 0, examples: [] },
    '「なぜ/なんで」系': { count: 0, examples: [] },
    '「何/なに」系': { count: 0, examples: [] },
    '「どう」系': { count: 0, examples: [] },
  }

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role !== 'user') continue
      totalUserMessages++

      const content = msg.content
      let isQuestion = false

      // Check for question marks
      if (/[？?]/.test(content)) {
        patternCounts['？や?を含む質問'].count++
        if (patternCounts['？や?を含む質問'].examples.length < 3) {
          patternCounts['？や?を含む質問'].examples.push(truncateText(content, 50))
        }
        isQuestion = true
      }

      // Check for 教えて patterns
      if (/教えて|おしえて/.test(content)) {
        patternCounts['「教えて」系'].count++
        if (patternCounts['「教えて」系'].examples.length < 3) {
          patternCounts['「教えて」系'].examples.push(truncateText(content, 50))
        }
        isQuestion = true
      }

      // Check for どうすれば patterns
      if (/どうすれば|どうしたら|どうやって/.test(content)) {
        patternCounts['「どうすれば」系'].count++
        if (patternCounts['「どうすれば」系'].examples.length < 3) {
          patternCounts['「どうすれば」系'].examples.push(truncateText(content, 50))
        }
        isQuestion = true
      }

      // Check for なぜ/なんで patterns
      if (/なぜ|なんで|どうして/.test(content)) {
        patternCounts['「なぜ/なんで」系'].count++
        if (patternCounts['「なぜ/なんで」系'].examples.length < 3) {
          patternCounts['「なぜ/なんで」系'].examples.push(truncateText(content, 50))
        }
        isQuestion = true
      }

      // Check for 何 patterns
      if (/何|なに|なん/.test(content)) {
        patternCounts['「何/なに」系'].count++
        if (patternCounts['「何/なに」系'].examples.length < 3) {
          patternCounts['「何/なに」系'].examples.push(truncateText(content, 50))
        }
        isQuestion = true
      }

      // Check for どう patterns
      if (/どう(?!すれば|したら|やって|して)/.test(content)) {
        patternCounts['「どう」系'].count++
        if (patternCounts['「どう」系'].examples.length < 3) {
          patternCounts['「どう」系'].examples.push(truncateText(content, 50))
        }
        isQuestion = true
      }

      if (isQuestion) {
        totalQuestions++
      }
    }
  }

  const patterns: QuestionPattern[] = Object.entries(patternCounts)
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      examples: data.examples,
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)

  return {
    totalQuestions,
    questionRate: totalUserMessages > 0 ? (totalQuestions / totalUserMessages) * 100 : 0,
    patterns,
  }
}

function findMVPConversations(conversations: Conversation[]): MVPConversation[] {
  const conversationStats = conversations.map((conv) => {
    const userMessages = conv.messages.filter((m) => m.role === 'user')
    const assistantMessages = conv.messages.filter((m) => m.role === 'assistant')
    const totalChars = conv.messages.reduce((sum, m) => sum + m.content.length, 0)

    return {
      id: conv.id,
      title: conv.title || '無題の会話',
      messageCount: conv.messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      totalChars,
      createTime: conv.createTime,
      messages: conv.messages.map((m) => ({
        role: m.role,
        content: m.content,
        createTime: m.createTime || undefined,
      })),
    }
  })

  // Sort by message count and take top 5
  return conversationStats.sort((a, b) => b.messageCount - a.messageCount).slice(0, 5)
}

function findFirstConversations(conversations: Conversation[]): MVPConversation[] {
  const conversationStats = conversations.map((conv) => {
    const userMessages = conv.messages.filter((m) => m.role === 'user')
    const assistantMessages = conv.messages.filter((m) => m.role === 'assistant')
    const totalChars = conv.messages.reduce((sum, m) => sum + m.content.length, 0)

    return {
      id: conv.id,
      title: conv.title || '無題の会話',
      messageCount: conv.messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      totalChars,
      createTime: conv.createTime,
      messages: conv.messages.map((m) => ({
        role: m.role,
        content: m.content,
        createTime: m.createTime || undefined,
      })),
    }
  })

  // Sort by createTime (oldest first) and take first 5
  return conversationStats.sort((a, b) => a.createTime.getTime() - b.createTime.getTime()).slice(0, 5)
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function calculateBehaviorStats(conversations: Conversation[]): BehaviorStats {
  const hourlyHeatmap = calculateHourlyHeatmap(conversations)
  const catchPhrases = calculateCatchPhrases(conversations)
  const ngramPhrases = calculateNgramPhrases(conversations)
  const gratitude = calculateGratitude(conversations)
  const confusion = calculateConfusion(conversations)

  return {
    hourlyHeatmap,
    catchPhrases,
    ngramPhrases,
    gratitude,
    confusion,
  }
}

function calculateHourlyHeatmap(conversations: Conversation[]): HourlyHeatmapData {
  // 7x24 matrix: [dayOfWeek][hour]
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role !== 'user') continue
      const date = msg.createTime || conv.createTime
      const dayOfWeek = date.getDay()
      const hour = date.getHours()
      matrix[dayOfWeek][hour]++
    }
  }

  // Find peak
  let peakHour = 0
  let peakDay = 0
  let peakCount = 0
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      if (matrix[day][hour] > peakCount) {
        peakCount = matrix[day][hour]
        peakHour = hour
        peakDay = day
      }
    }
  }

  return { matrix, peakHour, peakDay, peakCount }
}

// Common catch phrases to detect
const CATCH_PHRASE_PATTERNS = [
  // フィラー・つなぎ言葉
  'ちょっと',
  'とりあえず',
  'なんか',
  'っていうか',
  'まあ',
  'えーと',
  'あのー',
  'その',
  'なんだろう',
  'なんていうか',
  // 確認・同意系
  'やっぱり',
  'やっぱ',
  'やはり',
  'なるほど',
  'たしかに',
  'そうですね',
  'おっしゃる通り',
  // 話題転換
  'ちなみに',
  'というか',
  'ていうか',
  'ところで',
  'そういえば',
  'あと',
  'それと',
  'ついでに',
  // 説明・要約系
  'ぶっちゃけ',
  '正直',
  '結局',
  '要するに',
  '簡単に言うと',
  'つまり',
  '例えば',
  '具体的には',
  '基本的に',
  '一応',
  // 依頼・お願い系
  'お願い',
  'してほしい',
  'してください',
  'していただけ',
  '教えて',
  '助けて',
  // 謝罪・丁寧系
  'すみません',
  'すいません',
  'ごめん',
  'お手数',
  '恐れ入り',
  '申し訳',
  // 感情表現
  'なんとなく',
  'めっちゃ',
  'すごく',
  'かなり',
  'けっこう',
  '本当に',
  'マジで',
  // 思考・推測系
  '多分',
  'たぶん',
  'おそらく',
  '思うんですけど',
  '気がする',
  'かもしれない',
  // 逆接・条件
  'でも',
  'ただ',
  'けど',
  'ただし',
  'もし',
  '仮に',
  // 強調
  '絶対',
  '必ず',
  '特に',
  'とにかく',
  // その他よく使う表現
  '〜的な',
  '〜みたいな',
  '〜っぽい',
  'いわゆる',
  'そもそも',
  '実は',
  '個人的に',
]

function calculateCatchPhrases(conversations: Conversation[]): CatchPhrase[] {
  const phraseData = new Map<string, { count: number; usages: PhraseUsage[] }>()

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role !== 'user') continue
      const content = msg.content.toLowerCase()

      for (const phrase of CATCH_PHRASE_PATTERNS) {
        const regex = new RegExp(phrase, 'gi')
        const matches = content.match(regex)
        if (matches) {
          if (!phraseData.has(phrase)) {
            phraseData.set(phrase, { count: 0, usages: [] })
          }
          const data = phraseData.get(phrase)!
          data.count += matches.length

          // Track usage (max 10 per phrase)
          if (data.usages.length < 10) {
            data.usages.push({
              conversationId: conv.id,
              conversationTitle: conv.title || '無題の会話',
              messageContent: msg.content,
              createTime: msg.createTime || conv.createTime,
            })
          }
        }
      }
    }
  }

  return Array.from(phraseData.entries())
    .map(([phrase, data]) => ({ phrase, count: data.count, usages: data.usages }))
    .filter((p) => p.count >= 3) // Only show phrases used at least 3 times
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

const GRATITUDE_PATTERNS = [
  { pattern: 'ありがとう', regex: /ありがとう/gi },
  { pattern: 'ありがと', regex: /ありがと(?!う)/gi },
  { pattern: 'サンキュー', regex: /サンキュー/gi },
  { pattern: 'thanks', regex: /thanks/gi },
  { pattern: 'thank you', regex: /thank you/gi },
  { pattern: '感謝', regex: /感謝/gi },
  { pattern: '助かり', regex: /助かり/gi },
]

function calculateGratitude(conversations: Conversation[]): GratitudeStats {
  let totalUserMessages = 0
  let messagesWithThanks = 0
  const variationData = new Map<string, { count: number; usages: PhraseUsage[] }>()

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role !== 'user') continue
      totalUserMessages++

      let hasThanks = false
      for (const { pattern, regex } of GRATITUDE_PATTERNS) {
        const matches = msg.content.match(regex)
        if (matches) {
          if (!variationData.has(pattern)) {
            variationData.set(pattern, { count: 0, usages: [] })
          }
          const data = variationData.get(pattern)!
          data.count += matches.length
          hasThanks = true

          // Track usage (max 10 per pattern)
          if (data.usages.length < 10) {
            data.usages.push({
              conversationId: conv.id,
              conversationTitle: conv.title || '無題の会話',
              messageContent: msg.content,
              createTime: msg.createTime || conv.createTime,
            })
          }
        }
      }
      if (hasThanks) messagesWithThanks++
    }
  }

  const totalThanks = Array.from(variationData.values()).reduce((sum, data) => sum + data.count, 0)
  const variations: GratitudeVariation[] = Array.from(variationData.entries())
    .map(([phrase, data]) => ({ phrase, count: data.count, usages: data.usages }))
    .sort((a, b) => b.count - a.count)

  return {
    totalThanks,
    thanksRate: totalUserMessages > 0 ? (messagesWithThanks / totalUserMessages) * 100 : 0,
    variations,
  }
}

const CONFUSION_PATTERNS = [
  { pattern: 'わからない', regex: /わからない|分からない|わかんない/gi },
  { pattern: '教えて', regex: /教えて|おしえて/gi },
  { pattern: 'どうすれば', regex: /どうすれば|どうしたら/gi },
  { pattern: '困って', regex: /困って|こまって/gi },
  { pattern: 'できない', regex: /できない|出来ない/gi },
  { pattern: 'うまくいかない', regex: /うまくいかない|上手くいかない/gi },
  { pattern: 'エラー', regex: /エラー|error/gi },
  { pattern: 'なぜ', regex: /なぜ|なんで/gi },
  { pattern: '助けて', regex: /助けて|たすけて/gi },
]

function calculateConfusion(conversations: Conversation[]): ConfusionStats {
  let totalUserMessages = 0
  let messagesWithConfusion = 0
  const patternData = new Map<string, { count: number; usages: PhraseUsage[] }>()

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role !== 'user') continue
      totalUserMessages++

      let hasConfusion = false
      for (const { pattern, regex } of CONFUSION_PATTERNS) {
        const matches = msg.content.match(regex)
        if (matches) {
          if (!patternData.has(pattern)) {
            patternData.set(pattern, { count: 0, usages: [] })
          }
          const data = patternData.get(pattern)!
          data.count += matches.length
          hasConfusion = true

          // Track usage (max 10 per pattern)
          if (data.usages.length < 10) {
            data.usages.push({
              conversationId: conv.id,
              conversationTitle: conv.title || '無題の会話',
              messageContent: msg.content,
              createTime: msg.createTime || conv.createTime,
            })
          }
        }
      }
      if (hasConfusion) messagesWithConfusion++
    }
  }

  const totalConfused = Array.from(patternData.values()).reduce((sum, data) => sum + data.count, 0)
  const patterns: ConfusionPattern[] = Array.from(patternData.entries())
    .map(([pattern, data]) => ({ pattern, count: data.count, usages: data.usages }))
    .sort((a, b) => b.count - a.count)

  return {
    totalConfused,
    confusionRate: totalUserMessages > 0 ? (messagesWithConfusion / totalUserMessages) * 100 : 0,
    patterns,
  }
}

// N-gram分析: 頻出フレーズを自動検出（日本語のみ）
function calculateNgramPhrases(conversations: Conversation[]): NgramStats {
  const unigramData = new Map<string, { count: number; usages: PhraseUsage[] }>()
  const bigramData = new Map<string, { count: number; usages: PhraseUsage[] }>()
  const trigramData = new Map<string, { count: number; usages: PhraseUsage[] }>()

  // N-gramに含めない単語（助詞、助動詞など）
  const NGRAM_STOP_WORDS = new Set([
    'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
    'も', 'な', 'い', 'や', 'か', 'だ', 'う', 'ね', 'よ', 'わ', 'ん',
    'です', 'ます', 'ある', 'いる', 'する', 'なる', 'こと', 'もの', 'ない',
    'この', 'その', 'あの', 'どの', 'これ', 'それ', 'あれ', 'どれ',
    'から', 'まで', 'より', 'ので', 'のに', 'けど', 'けれど',
    'という', 'といった', 'として', 'について', 'における', 'によって',
    'ください', 'ほしい', 'たい', 'られ', 'せる', 'させ',
  ])

  // 日本語を含むかどうかをチェック
  const containsJapanese = (token: string): boolean => {
    // ひらがな、カタカナ、漢字のいずれかを含む
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(token)
  }

  // 単語として有効かどうかをチェック（日本語のみ）
  const isValidToken = (token: string): boolean => {
    if (token.length < 2) return false
    if (!containsJapanese(token)) return false // 日本語を含まない場合は除外
    if (NGRAM_STOP_WORDS.has(token)) return false
    if (/^\d+$/.test(token)) return false
    if (/^[。、！？「」『』（）\[\]【】・…―～：；""''.,!?;:'"()\[\]{}\s]+$/.test(token)) return false
    if (/^[\u3040-\u309F]$/.test(token)) return false // 単独のひらがな
    if (/^[\u3040-\u309F]{2}$/.test(token)) return false // 2文字のひらがなのみも除外
    return true
  }

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.role !== 'user') continue

      // TinySegmenterで分かち書き
      const segments: string[] = segmenter.segment(msg.content)
      const tokens = segments.filter(isValidToken)

      // Unigram (1単語)
      for (let i = 0; i < tokens.length; i++) {
        const unigram = tokens[i]
        if (!unigramData.has(unigram)) {
          unigramData.set(unigram, { count: 0, usages: [] })
        }
        const data = unigramData.get(unigram)!
        data.count++
        if (data.usages.length < 10) {
          data.usages.push({
            conversationId: conv.id,
            conversationTitle: conv.title || '無題の会話',
            messageContent: msg.content,
            createTime: msg.createTime || conv.createTime,
          })
        }
      }

      // Bigram (2単語の組み合わせ)
      for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`
        if (!bigramData.has(bigram)) {
          bigramData.set(bigram, { count: 0, usages: [] })
        }
        const data = bigramData.get(bigram)!
        data.count++
        if (data.usages.length < 10) {
          data.usages.push({
            conversationId: conv.id,
            conversationTitle: conv.title || '無題の会話',
            messageContent: msg.content,
            createTime: msg.createTime || conv.createTime,
          })
        }
      }

      // Trigram (3単語の組み合わせ)
      for (let i = 0; i < tokens.length - 2; i++) {
        const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`
        if (!trigramData.has(trigram)) {
          trigramData.set(trigram, { count: 0, usages: [] })
        }
        const data = trigramData.get(trigram)!
        data.count++
        if (data.usages.length < 10) {
          data.usages.push({
            conversationId: conv.id,
            conversationTitle: conv.title || '無題の会話',
            messageContent: msg.content,
            createTime: msg.createTime || conv.createTime,
          })
        }
      }
    }
  }

  // 結果をソートしてフィルタリング
  const unigrams: NgramPhrase[] = Array.from(unigramData.entries())
    .map(([phrase, data]) => ({ phrase, count: data.count, n: 1, usages: data.usages }))
    .filter((p) => p.count >= 5) // 5回以上使用されたもの
    .sort((a, b) => b.count - a.count)
    .slice(0, 20) // 上位20件

  const bigrams: NgramPhrase[] = Array.from(bigramData.entries())
    .map(([phrase, data]) => ({ phrase, count: data.count, n: 2, usages: data.usages }))
    .filter((p) => p.count >= 5) // 5回以上使用されたもの
    .sort((a, b) => b.count - a.count)
    .slice(0, 15) // 上位15件

  const trigrams: NgramPhrase[] = Array.from(trigramData.entries())
    .map(([phrase, data]) => ({ phrase, count: data.count, n: 3, usages: data.usages }))
    .filter((p) => p.count >= 3) // 3回以上使用されたもの
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // 上位10件

  return { unigrams, bigrams, trigrams }
}
