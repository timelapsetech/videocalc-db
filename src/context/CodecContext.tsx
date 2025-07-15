import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';

export interface CodecVariant {
  name: string;
  bitrates: {
    [resolution: string]: {
      [frameRate: string]: number; // Mbps for specific frame rate
    } | number; // Fallback for simple number format
  };
  description?: string;
}

export interface Codec {
  id: string;
  name: string;
  variants: CodecVariant[];
  description?: string;
  workflowNotes?: string;
}

export interface CodecCategory {
  id: string;
  name: string;
  codecs: Codec[];
  description?: string;
}

interface CodecContextType {
  categories: CodecCategory[];
  loading: boolean;
  error: string | null;
  updateCategories: (categories: CodecCategory[]) => void;
  refreshCategories: () => Promise<void>;
  resetToDefaults: () => void;
  importFromFirebase: () => Promise<void>;
  exportToFirebase: (categories: CodecCategory[]) => Promise<void>;
}

const CodecContext = createContext<CodecContextType | undefined>(undefined);

export const CodecProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<CodecCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategoriesFromFirebase();
  }, []);

  const loadCategoriesFromFirebase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading categories from Firebase...');
      
      // Test Firebase connection first
      const isConnected = await firebaseService.testConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to Firebase. Please check your configuration.');
      }
      
      const firebaseCategories = await firebaseService.getCategories();
      console.log('Loaded categories:', firebaseCategories);
      setCategories(firebaseCategories);
      
      // Cache locally for offline access
      localStorage.setItem('codecData', JSON.stringify(firebaseCategories));
    } catch (error) {
      console.error('Error loading categories from Firebase:', error);
      setError(error instanceof Error ? error.message : 'Failed to load codec data');
      
      // Try to load from local cache as fallback
      const cachedData = localStorage.getItem('codecData');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setCategories(parsedData);
          console.log('Loaded codec data from local cache');
        } catch (parseError) {
          console.error('Error parsing cached data:', parseError);
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    await loadCategoriesFromFirebase();
  };

  const updateCategories = (newCategories: CodecCategory[]) => {
    setCategories(newCategories);
    // Update local cache
    localStorage.setItem('codecData', JSON.stringify(newCategories));
  };

  const resetToDefaults = () => {
    // For now, just clear the categories - admin can re-import default data
    setCategories([]);
    localStorage.removeItem('codecData');
  };

  const importFromFirebase = async () => {
    await loadCategoriesFromFirebase();
  };

  const exportToFirebase = async (categories: CodecCategory[]) => {
    try {
      setError(null);
      await firebaseService.importCodecData(categories);
      await refreshCategories(); // Reload from Firebase to confirm
    } catch (error) {
      console.error('Error exporting to Firebase:', error);
      setError(error instanceof Error ? error.message : 'Failed to export to Firebase');
      throw error;
    }
  };

  // Show loading state while codec data is being loaded
  if (loading && categories.length === 0) {
    return (
      <CodecContext.Provider value={{ 
        categories: [], 
        loading, 
        error, 
        updateCategories, 
        refreshCategories, 
        resetToDefaults, 
        importFromFirebase, 
        exportToFirebase 
      }}>
        {children}
      </CodecContext.Provider>
    );
  }

  return (
    <CodecContext.Provider value={{ 
      categories, 
      loading, 
      error, 
      updateCategories, 
      refreshCategories, 
      resetToDefaults, 
      importFromFirebase, 
      exportToFirebase 
    }}>
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