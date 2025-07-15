import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { CodecCategory, Codec, CodecVariant } from '../context/CodecContext';

class FirebaseService {
  private googleProvider = new GoogleAuthProvider();

  // Authentication methods for admin access
  async signInWithGoogle(): Promise<any> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      
      // Check if the error is due to popup being blocked or closed
      if (error instanceof Error && 
          (error.message.includes('auth/popup-blocked') || 
           error.message.includes('auth/popup-closed-by-user'))) {
        console.log('Popup blocked or closed, falling back to redirect...');
        // Fallback to redirect method
        await signInWithRedirect(auth, this.googleProvider);
        // The redirect will happen, so we don't return anything here
        // The result will be handled by handleRedirectSignInResult
        return null;
      }
      
      throw error;
    }
  }

  // Handle the result after redirect-based sign-in
  async handleRedirectSignInResult(): Promise<any> {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        console.log('Redirect sign-in successful:', result.user);
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Error handling redirect result:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  // Check if current user is authorized admin
  isAuthorizedAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Get admin emails from environment or use default
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(email => email.trim()).filter(Boolean);
    
    // If no admin emails configured, deny access for security
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured');
      return false;
    }

    return adminEmails.includes(user.email || '');
  }

  // Public read methods (no authentication required)
  async getCategories(): Promise<CodecCategory[]> {
    try {
      console.log('Fetching categories from Firebase...');
      
      // Get all documents from the root collection
      const rootCollection = collection(db, 'codecs'); // Assuming your collection is named 'codecs'
      const snapshot = await getDocs(rootCollection);
      
      if (snapshot.empty) {
        console.log('No documents found in Firebase');
        return [];
      }

      const categories: CodecCategory[] = [];
      const categoryMap = new Map<string, CodecCategory>();

      // Process each document
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        console.log('Processing document:', docSnapshot.id, data);

        // Extract category information
        const categoryId = data.category_id || data.categoryId || 'unknown';
        const categoryName = data.category || 'Unknown Category';
        const categoryDescription = data.description || '';

        // Get or create category
        let category = categoryMap.get(categoryId);
        if (!category) {
          category = {
            id: categoryId,
            name: categoryName,
            description: categoryDescription,
            codecs: []
          };
          categoryMap.set(categoryId, category);
        }

        // Create codec from document data
        const codec: Codec = {
          id: data.id || docSnapshot.id,
          name: data.name || 'Unknown Codec',
          description: data.description || '',
          workflowNotes: data.workflowNotes || '',
          variants: []
        };

        // Process variants
        if (data.variants && Array.isArray(data.variants)) {
          for (const variantData of data.variants) {
            if (variantData && variantData.bitrates) {
              const variant: CodecVariant = {
                name: variantData.name || 'Unknown Variant',
                description: variantData.description || '',
                bitrates: variantData.bitrates
              };
              codec.variants.push(variant);
            }
          }
        }

        category.codecs.push(codec);
      }

      // Convert map to array
      const result = Array.from(categoryMap.values());
      console.log('Processed categories:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch codec categories from Firebase');
    }
  }

  // Admin-only write methods (require authentication and authorization)
  private checkAdminAccess(): void {
    if (!this.isAuthorizedAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }
  }

  // Bulk operations for data import (admin only)
  async importCodecData(categories: CodecCategory[]): Promise<void> {
    this.checkAdminAccess();
    
    try {
      console.log('Importing codec data to Firebase...');
      const batch = writeBatch(db);
      
      // Clear existing data first
      const existingDocs = await getDocs(collection(db, 'codecs'));
      existingDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add new data
      for (const category of categories) {
        for (const codec of category.codecs) {
          const docRef = doc(collection(db, 'codecs'));
          
          const codecData = {
            id: codec.id,
            name: codec.name,
            description: codec.description || '',
            workflowNotes: codec.workflowNotes || '',
            category: category.name,
            category_id: category.id,
            variants: codec.variants.map(variant => ({
              name: variant.name,
              description: variant.description || '',
              bitrates: variant.bitrates
            })),
            firebase_created_at: new Date().toISOString(),
            firebase_updated_at: new Date().toISOString(),
            source: 'admin_import'
          };
          
          batch.set(docRef, codecData);
        }
      }
      
      await batch.commit();
      console.log('Successfully imported codec data to Firebase');
    } catch (error) {
      console.error('Error importing codec data:', error);
      throw new Error('Failed to import codec data to Firebase');
    }
  }

  async exportCodecData(): Promise<CodecCategory[]> {
    return await this.getCategories();
  }

  // Real-time listeners (public read access)
  subscribeToCategories(callback: (categories: CodecCategory[]) => void): () => void {
    const rootCollection = collection(db, 'codecs');
    
    return onSnapshot(rootCollection, async (snapshot) => {
      try {
        console.log('Firebase data changed, updating categories...');
        const categories = await this.getCategories();
        callback(categories);
      } catch (error) {
        console.error('Error in categories subscription:', error);
      }
    });
  }

  // Check if Firebase is properly configured and accessible
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Firebase connection...');
      const testCollection = collection(db, 'codecs');
      await getDocs(testCollection);
      console.log('Firebase connection successful');
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;