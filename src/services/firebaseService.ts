import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
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

  // Variant CRUD operations (admin only)
  async addVariant(categoryId: string, codecId: string, variant: CodecVariant): Promise<void> {
    this.checkAdminAccess();
    
    try {
      console.log('Adding variant to codec:', codecId, 'in category:', categoryId);
      
      // Find the document that contains this codec
      const codecsCollection = collection(db, 'codecs');
      const snapshot = await getDocs(codecsCollection);
      
      let targetDocId: string | null = null;
      let targetDocData: any = null;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        if (data.category_id === categoryId && data.id === codecId) {
          targetDocId = docSnapshot.id;
          targetDocData = data;
          break;
        }
      }
      
      if (!targetDocId || !targetDocData) {
        throw new Error(`Codec ${codecId} not found in category ${categoryId}`);
      }
      
      // Check if variant name already exists
      const existingVariants = targetDocData.variants || [];
      if (existingVariants.some((v: any) => v.name === variant.name)) {
        throw new Error(`Variant "${variant.name}" already exists in this codec`);
      }
      
      // Add the new variant
      const updatedVariants = [...existingVariants, {
        name: variant.name,
        description: variant.description || '',
        bitrates: variant.bitrates
      }];
      
      // Update the document
      const docRef = doc(db, 'codecs', targetDocId);
      await updateDoc(docRef, {
        variants: updatedVariants,
        firebase_updated_at: new Date().toISOString()
      });
      
      console.log('Successfully added variant to Firebase');
    } catch (error) {
      console.error('Error adding variant:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add variant');
    }
  }

  async updateVariant(categoryId: string, codecId: string, variantName: string, updatedVariant: CodecVariant): Promise<void> {
    this.checkAdminAccess();
    
    try {
      console.log('Updating variant:', variantName, 'in codec:', codecId);
      
      // Find the document that contains this codec
      const codecsCollection = collection(db, 'codecs');
      const snapshot = await getDocs(codecsCollection);
      
      let targetDocId: string | null = null;
      let targetDocData: any = null;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        if (data.category_id === categoryId && data.id === codecId) {
          targetDocId = docSnapshot.id;
          targetDocData = data;
          break;
        }
      }
      
      if (!targetDocId || !targetDocData) {
        throw new Error(`Codec ${codecId} not found in category ${categoryId}`);
      }
      
      // Find and update the variant
      const existingVariants = targetDocData.variants || [];
      const variantIndex = existingVariants.findIndex((v: any) => v.name === variantName);
      
      if (variantIndex === -1) {
        throw new Error(`Variant "${variantName}" not found in codec ${codecId}`);
      }
      
      // Check if new name conflicts with existing variants (if name is being changed)
      if (updatedVariant.name !== variantName) {
        if (existingVariants.some((v: any, index: number) => index !== variantIndex && v.name === updatedVariant.name)) {
          throw new Error(`Variant "${updatedVariant.name}" already exists in this codec`);
        }
      }
      
      // Update the variant
      const updatedVariants = [...existingVariants];
      updatedVariants[variantIndex] = {
        name: updatedVariant.name,
        description: updatedVariant.description || '',
        bitrates: updatedVariant.bitrates
      };
      
      // Update the document
      const docRef = doc(db, 'codecs', targetDocId);
      await updateDoc(docRef, {
        variants: updatedVariants,
        firebase_updated_at: new Date().toISOString()
      });
      
      console.log('Successfully updated variant in Firebase');
    } catch (error) {
      console.error('Error updating variant:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update variant');
    }
  }

  async deleteVariant(categoryId: string, codecId: string, variantName: string): Promise<void> {
    this.checkAdminAccess();
    
    try {
      console.log('Deleting variant:', variantName, 'from codec:', codecId);
      
      // Find the document that contains this codec
      const codecsCollection = collection(db, 'codecs');
      const snapshot = await getDocs(codecsCollection);
      
      let targetDocId: string | null = null;
      let targetDocData: any = null;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        if (data.category_id === categoryId && data.id === codecId) {
          targetDocId = docSnapshot.id;
          targetDocData = data;
          break;
        }
      }
      
      if (!targetDocId || !targetDocData) {
        throw new Error(`Codec ${codecId} not found in category ${categoryId}`);
      }
      
      // Find and remove the variant
      const existingVariants = targetDocData.variants || [];
      const variantIndex = existingVariants.findIndex((v: any) => v.name === variantName);
      
      if (variantIndex === -1) {
        throw new Error(`Variant "${variantName}" not found in codec ${codecId}`);
      }
      
      // Prevent deletion if it's the last variant
      if (existingVariants.length === 1) {
        throw new Error('Cannot delete the last variant from a codec');
      }
      
      // Remove the variant
      const updatedVariants = existingVariants.filter((v: any) => v.name !== variantName);
      
      // Update the document
      const docRef = doc(db, 'codecs', targetDocId);
      await updateDoc(docRef, {
        variants: updatedVariants,
        firebase_updated_at: new Date().toISOString()
      });
      
      console.log('Successfully deleted variant from Firebase');
    } catch (error) {
      console.error('Error deleting variant:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete variant');
    }
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