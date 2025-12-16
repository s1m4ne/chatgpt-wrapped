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

    // Determine initial keys (localStorageのみ)
    const geminiKey = storedGeminiKey || null
    const openaiKey = storedOpenAIKey || null

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
            className={`flex-1 py-2 px-4 pixel-btn text-xs ${
              provider === 'gemini'
                ? 'bg-nes-purple border-purple-300 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-400'
            }`}
          >
            GEMINI
          </button>
          <button
            onClick={() => handleProviderChange('openai')}
            className={`flex-1 py-2 px-4 pixel-btn text-xs ${
              provider === 'openai'
                ? 'bg-nes-green border-green-300 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-400'
            }`}
          >
            OPENAI
          </button>
        </div>

        <div className="pixel-box border-green-500 bg-green-500/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="nes-green">*</span>
              <span className="text-green-300 text-xs">
                {provider === 'gemini' ? 'GEMINI' : 'OPENAI'} KEY SET
              </span>
            </div>
            <button
              onClick={handleDelete}
              className="text-xs text-gray-400 hover:text-red-400 pixel-btn bg-gray-800 border-gray-600 px-2 py-1"
            >
              DEL
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            {currentSavedKey.slice(0, 10)}...{currentSavedKey.slice(-4)}
          </p>
          {provider === 'openai' && (
            <p className="text-xs text-gray-400 mt-2">
              &gt; MODEL: gpt-5-nano
            </p>
          )}
          {provider === 'gemini' && (
            <p className="text-xs text-gray-400 mt-2">
              &gt; MODEL: gemini-2.0-flash
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
          className={`flex-1 py-2 px-4 pixel-btn text-xs ${
            provider === 'gemini'
              ? 'bg-nes-purple border-purple-300 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-400'
          }`}
        >
          GEMINI
        </button>
        <button
          onClick={() => handleProviderChange('openai')}
          className={`flex-1 py-2 px-4 pixel-btn text-xs ${
            provider === 'openai'
              ? 'bg-nes-green border-green-300 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-400'
          }`}
        >
          OPENAI
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-xs text-gray-300 mb-2">
            &gt; {provider === 'gemini' ? 'GEMINI' : 'OPENAI'} API KEY
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
            className="w-full px-4 py-3 pixel-box border-gray-600 bg-gray-800
                       text-gray-100 placeholder-gray-500 text-xs
                       focus:outline-none focus:border-nes-cyan"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="saveKey"
            checked={saveToStorage}
            onChange={(e) => setSaveToStorage(e.target.checked)}
            className="w-4 h-4 accent-nes-purple"
          />
          <label htmlFor="saveKey" className="text-xs text-gray-400">
            &gt; SAVE TO BROWSER
          </label>
        </div>

        {validationError && (
          <div className="p-3 pixel-box border-red-500 bg-red-500/10">
            <p className="nes-red text-xs">&gt; ERROR: {validationError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isValidating || !apiKey.trim()}
          className={`w-full py-3 px-4 pixel-btn text-white text-xs ${
            provider === 'gemini'
              ? 'bg-nes-purple border-purple-300'
              : 'bg-nes-green border-green-300'
          } disabled:bg-gray-700 disabled:border-gray-600 disabled:cursor-not-allowed`}
        >
          {isValidating ? (
            <>
              <span className="pixel-bounce inline-block">.</span>
              <span className="pixel-bounce inline-block" style={{ animationDelay: '0.1s' }}>.</span>
              <span className="pixel-bounce inline-block" style={{ animationDelay: '0.2s' }}>.</span>
              CHECKING
            </>
          ) : (
            '&gt; SET API KEY'
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
              className="nes-cyan hover:underline"
            >
              &gt; Google AI Studio
            </a>
          </>
        ) : (
          <>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="nes-cyan hover:underline"
            >
              &gt; OpenAI Dashboard
            </a>
          </>
        )}
      </p>
    </div>
  )
}
