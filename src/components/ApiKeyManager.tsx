import { useState, useEffect, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import type { LLMProvider } from '../types'

interface ApiKeyManagerProps {
  onApiKeyChange: (provider: LLMProvider, apiKey: string | null) => void
}

const STORAGE_KEY_PROVIDER = 'chatgpt-wrapped-llm-provider'
const STORAGE_KEY_GEMINI = 'chatgpt-wrapped-gemini-api-key'
const STORAGE_KEY_OPENAI = 'chatgpt-wrapped-openai-api-key'

const ENV_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const ENV_OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

export function ApiKeyManager({ onApiKeyChange }: ApiKeyManagerProps) {
  const [provider, setProvider] = useState<LLMProvider>('gemini')
  const [apiKey, setApiKey] = useState('')
  const [savedKeys, setSavedKeys] = useState<Record<LLMProvider, string | null>>({
    gemini: null,
    openai: null,
  })
  const [saveToStorage, setSaveToStorage] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    // Load saved provider
    const storedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER) as LLMProvider | null
    const storedGeminiKey = localStorage.getItem(STORAGE_KEY_GEMINI)
    const storedOpenAIKey = localStorage.getItem(STORAGE_KEY_OPENAI)

    // Determine initial keys (localStorage優先、なければ環境変数)
    const geminiKey = storedGeminiKey || ENV_GEMINI_KEY || null
    const openaiKey = storedOpenAIKey || ENV_OPENAI_KEY || null

    setSavedKeys({ gemini: geminiKey, openai: openaiKey })

    // Determine initial provider
    const initialProvider = storedProvider || (geminiKey ? 'gemini' : openaiKey ? 'openai' : 'gemini')
    setProvider(initialProvider)

    const currentKey = initialProvider === 'gemini' ? geminiKey : openaiKey
    if (currentKey) {
      setApiKey(currentKey)
      setSaveToStorage(true)
      onApiKeyChange(initialProvider, currentKey)
      setIsValid(true)
    }
  }, [onApiKeyChange])

  const validateGeminiKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      const genAI = new GoogleGenerativeAI(key)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      await model.generateContent('test')
      return true
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
          throw new Error('無効なAPIキーです')
        }
        if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error('APIキーに必要な権限がありません')
        }
      }
      throw new Error('APIキーの検証に失敗しました')
    }
  }, [])

  const validateOpenAIKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      const client = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true })
      await client.models.list()
      return true
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401) {
          throw new Error('無効なAPIキーです')
        }
        if (error.status === 403) {
          throw new Error('APIキーに必要な権限がありません')
        }
      }
      throw new Error('APIキーの検証に失敗しました')
    }
  }, [])

  const handleProviderChange = useCallback(
    (newProvider: LLMProvider) => {
      setProvider(newProvider)
      setValidationError(null)

      const savedKey = savedKeys[newProvider]
      if (savedKey) {
        setApiKey(savedKey)
        setIsValid(true)
        onApiKeyChange(newProvider, savedKey)
      } else {
        setApiKey('')
        setIsValid(false)
        onApiKeyChange(newProvider, null)
      }

      localStorage.setItem(STORAGE_KEY_PROVIDER, newProvider)
    },
    [savedKeys, onApiKeyChange]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!apiKey.trim()) return

      setIsValidating(true)
      setValidationError(null)

      try {
        if (provider === 'gemini') {
          await validateGeminiKey(apiKey)
        } else {
          await validateOpenAIKey(apiKey)
        }
        setIsValid(true)

        if (saveToStorage) {
          const storageKey = provider === 'gemini' ? STORAGE_KEY_GEMINI : STORAGE_KEY_OPENAI
          localStorage.setItem(storageKey, apiKey)
          localStorage.setItem(STORAGE_KEY_PROVIDER, provider)
        }

        setSavedKeys((prev) => ({ ...prev, [provider]: apiKey }))
        onApiKeyChange(provider, apiKey)
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : '検証に失敗しました')
        setIsValid(false)
      } finally {
        setIsValidating(false)
      }
    },
    [apiKey, provider, saveToStorage, validateGeminiKey, validateOpenAIKey, onApiKeyChange]
  )

  const handleDelete = useCallback(() => {
    const storageKey = provider === 'gemini' ? STORAGE_KEY_GEMINI : STORAGE_KEY_OPENAI
    localStorage.removeItem(storageKey)
    setApiKey('')
    setSavedKeys((prev) => ({ ...prev, [provider]: null }))
    setIsValid(false)
    onApiKeyChange(provider, null)
  }, [provider, onApiKeyChange])

  const currentSavedKey = savedKeys[provider]

  if (isValid && currentSavedKey) {
    return (
      <div className="w-full max-w-xl mx-auto">
        {/* Provider selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleProviderChange('gemini')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              provider === 'gemini'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Gemini
          </button>
          <button
            onClick={() => handleProviderChange('openai')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              provider === 'openai'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            OpenAI
          </button>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-300">
                {provider === 'gemini' ? 'Gemini' : 'OpenAI'} APIキー設定済み
              </span>
            </div>
            <button
              onClick={handleDelete}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              削除
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {currentSavedKey.slice(0, 10)}...{currentSavedKey.slice(-4)}
          </p>
          {provider === 'openai' && (
            <p className="text-xs text-gray-400 mt-2">
              使用モデル: gpt-5-nano (Chat), text-embedding-3-small (Embedding)
            </p>
          )}
          {provider === 'gemini' && (
            <p className="text-xs text-gray-400 mt-2">
              使用モデル: gemini-2.0-flash (Chat), text-embedding-004 (Embedding)
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Provider selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleProviderChange('gemini')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            provider === 'gemini'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Gemini
        </button>
        <button
          onClick={() => handleProviderChange('openai')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            provider === 'openai'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          OpenAI
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
            {provider === 'gemini' ? 'Gemini' : 'OpenAI'} APIキー
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg
                       text-gray-100 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="saveKey"
            checked={saveToStorage}
            onChange={(e) => setSaveToStorage(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
          />
          <label htmlFor="saveKey" className="text-sm text-gray-400">
            ブラウザに保存する
          </label>
        </div>

        {validationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{validationError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isValidating || !apiKey.trim()}
          className={`w-full py-3 px-4 ${
            provider === 'gemini'
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-green-600 hover:bg-green-700'
          } disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg
                     transition-colors flex items-center justify-center gap-2`}
        >
          {isValidating ? (
            <>
              <span className="animate-spin">⏳</span>
              検証中...
            </>
          ) : (
            'APIキーを設定'
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        {provider === 'gemini' ? (
          <>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              Google AI Studio
            </a>
            でAPIキーを取得できます
          </>
        ) : (
          <>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline"
            >
              OpenAI Dashboard
            </a>
            でAPIキーを取得できます
          </>
        )}
      </p>
    </div>
  )
}
