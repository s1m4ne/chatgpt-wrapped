import { useState } from 'react'
import type { InsightsStats, MVPConversation, WordFrequency } from '../../types'

interface InsightsCardProps {
  insights: InsightsStats
}

export function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <div className="space-y-4 sm:space-y-8">
      <FrequentWordsSection words={insights.frequentWords} />
      <QuestionStatsSection stats={insights.questionStats} />
      <MVPConversationsSection conversations={insights.mvpConversations} />
    </div>
  )
}

function FrequentWordsSection({ words }: { words: InsightsStats['frequentWords'] }) {
  const [selectedWord, setSelectedWord] = useState<WordFrequency | null>(null)

  if (words.length === 0) return null

  const maxCount = words[0]?.count || 1

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">
          頻出キーワード
        </h3>
        <p className="text-xs text-gray-400 mb-3">会話に登場したキーワード（クリックで詳細）</p>
        <div className="flex flex-wrap gap-2">
          {words.slice(0, 20).map((item, index) => {
            const intensity = item.count / maxCount
            const sizeClass =
              intensity > 0.7
                ? 'text-lg sm:text-xl'
                : intensity > 0.4
                  ? 'text-base sm:text-lg'
                  : 'text-sm sm:text-base'
            const bgClass =
              intensity > 0.7
                ? 'bg-purple-600/60 hover:bg-purple-500/60'
                : intensity > 0.4
                  ? 'bg-purple-700/50 hover:bg-purple-600/50'
                  : 'bg-purple-800/40 hover:bg-purple-700/40'

            return (
              <button
                key={index}
                onClick={() => setSelectedWord(item)}
                className={`${sizeClass} ${bgClass} px-2 sm:px-3 py-1 rounded-full text-purple-100 transition-all hover:scale-105 cursor-pointer`}
              >
                {item.word}
                <span className="text-xs ml-1 text-purple-300">({item.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Word Usage Modal */}
      {selectedWord && (
        <WordUsageModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </>
  )
}

function WordUsageModal({ word, onClose }: { word: WordFrequency; onClose: () => void }) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="font-semibold text-white">
              「{word.word}」の使用例
            </h3>
            <p className="text-xs text-gray-400">{word.count}回使用 • {word.usages.length}件の会話</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Usage List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {word.usages.map((usage, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-purple-300 text-sm truncate flex-1">
                  {usage.conversationTitle}
                </div>
                <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {usage.createTime.toLocaleDateString('ja-JP')}
                </div>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">
                {truncateText(usage.messageContent, 200)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

function QuestionStatsSection({ stats }: { stats: InsightsStats['questionStats'] }) {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">
        質問の傾向
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-pink-400">
            {stats.totalQuestions.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">質問の総数</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-pink-400">
            {stats.questionRate.toFixed(1)}%
          </div>
          <div className="text-xs sm:text-sm text-gray-400">質問率</div>
        </div>
      </div>

      <div className="space-y-2">
        {stats.patterns.map((pattern) => (
          <div key={pattern.pattern} className="bg-gray-900/30 rounded-lg overflow-hidden">
            <button
              onClick={() =>
                setExpandedPattern(expandedPattern === pattern.pattern ? null : pattern.pattern)
              }
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
            >
              <span className="text-sm text-gray-200">{pattern.pattern}</span>
              <span className="text-sm font-semibold text-pink-400">
                {pattern.count.toLocaleString()}回
              </span>
            </button>
            {expandedPattern === pattern.pattern && pattern.examples.length > 0 && (
              <div className="px-3 pb-3 space-y-1">
                <div className="text-xs text-gray-500 mb-1">例:</div>
                {pattern.examples.map((example, i) => (
                  <div key={i} className="text-xs text-gray-400 bg-gray-800/50 rounded px-2 py-1">
                    "{example}"
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MVPConversationsSection({ conversations }: { conversations: MVPConversation[] }) {
  const [selectedConversation, setSelectedConversation] = useState<MVPConversation | null>(null)

  if (conversations.length === 0) return null

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-purple-300">
          年間MVP会話 🏆
        </h3>
        <p className="text-xs text-gray-400 mb-3">最もやり取りが多かった会話</p>

        <div className="space-y-2">
          {conversations.map((conv, index) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="w-full bg-gray-900/30 rounded-lg p-3 hover:bg-gray-700/30 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{conv.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {conv.messageCount}メッセージ • {(conv.totalChars / 1000).toFixed(1)}k文字
                  </div>
                  <div className="text-xs text-gray-500">
                    {conv.createTime.toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div className="text-purple-400 text-sm">詳細 →</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <ConversationModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </>
  )
}

function ConversationModal({
  conversation,
  onClose,
}: {
  conversation: MVPConversation
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="font-semibold text-white">{conversation.title}</h3>
            <p className="text-xs text-gray-400">
              {conversation.messageCount}メッセージ •{' '}
              {conversation.createTime.toLocaleDateString('ja-JP')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="text-xs mb-1 opacity-60">
                    {message.role === 'user' ? 'あなた' : 'ChatGPT'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content.length > 500
                      ? message.content.slice(0, 500) + '...'
                      : message.content}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
