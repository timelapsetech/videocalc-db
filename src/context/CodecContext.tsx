import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBundledCodecCategories } from '../data/loadCodecCatalog';
import type { CodecCategory } from '../types/codecs';

export type { CodecVariant, Codec, CodecCategory } from '../types/codecs';

interface CodecContextType {
  categories: CodecCategory[];
  loading: boolean;
  error: string | null;
}

const CodecContext = createContext<CodecContextType | undefined>(undefined);

export const CodecProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<CodecCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategoriesFromBundle = useCallback(() => {
    try {
      setLoading(true);
      const bundled = getBundledCodecCategories();
      if (!bundled.length) {
        throw new Error('Codec catalog is empty');
      }
      setCategories(bundled);
      setError(null);
    } catch (err) {
      console.error('Error loading bundled codec data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load codec data');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategoriesFromBundle();
  }, [loadCategoriesFromBundle]);

  if (loading && categories.length === 0) {
    return (
      <CodecContext.Provider
        value={{
          categories: [],
          loading,
          error,
        }}
      >
        {children}
      </CodecContext.Provider>
    );
  }

  return (
    <CodecContext.Provider
      value={{
        categories,
        loading,
        error,
      }}
    >
      {children}
    </CodecContext.Provider>
  );
};

export const useCodecContext = () => {
  const context = useContext(CodecContext);
  if (!context) {
    throw new Error('useCodecContext must be used within CodecProvider');
  }
  return context;
};
