# Design Document

## Overview

This design outlines the implementation of two key improvements to the Video File Size Calculator application:

1. **UI Simplification**: Remove the calculate button from the main interface since calculations are already performed automatically on input changes
2. **Enhanced Admin CRUD**: Implement full CRUD operations for codec variants in the admin interface with Firestore persistence

The changes will improve user experience by reducing interface clutter and provide administrators with comprehensive codec variant management capabilities.

## Architecture

### Current Architecture Analysis

The application follows a React-based architecture with:
- **Context API** for state management (CodecContext, PresetContext)
- **Firebase Firestore** for data persistence
- **Component-based UI** with TypeScript
- **Service layer** for Firebase operations

### Proposed Changes

#### 1. Calculator UI Simplification
- Remove calculate button from `Calculator.tsx`
- Maintain existing auto-calculation functionality
- Preserve manual calculation state management for edge cases

#### 2. Admin Codec Variant Management
- Extend `FirebaseCodecManager.tsx` with variant-level CRUD operations
- Add new service methods in `firebaseService.ts` for variant operations
- Implement UI components for variant editing within the admin interface

## Components and Interfaces

### Modified Components

#### Calculator.tsx
- **Remove**: Calculate button and related click handlers
- **Preserve**: All existing auto-calculation logic
- **Maintain**: Manual calculation state for URL-based calculations

#### FirebaseCodecManager.tsx
- **Add**: Variant management section for each codec
- **Add**: Inline editing capabilities for variants
- **Add**: Add/Edit/Delete buttons for individual variants
- **Enhance**: Display to show expandable variant lists

#### Admin.tsx
- **Maintain**: Existing tab structure and navigation
- **Update**: Firebase Codec Database tab to accommodate new variant management

### New Interface Extensions

```typescript
// Extend existing interfaces in firebaseService.ts
interface VariantOperations {
  addVariant(categoryId: string, codecId: string, variant: CodecVariant): Promise<void>;
  updateVariant(categoryId: string, codecId: string, variantName: string, variant: CodecVariant): Promise<void>;
  deleteVariant(categoryId: string, codecId: string, variantName: string): Promise<void>;
}

// UI State interfaces for variant editing
interface VariantEditState {
  isEditing: boolean;
  editingVariant: CodecVariant | null;
  isAddingNew: boolean;
}
```

## Data Models

### Existing Data Structure
The current Firebase document structure stores codecs with embedded variants:

```typescript
{
  id: string;
  name: string;
  category: string;
  category_id: string;
  variants: CodecVariant[];
  // ... other fields
}
```

### Variant CRUD Operations
Variant operations will modify the `variants` array within codec documents:

1. **Create**: Add new variant to variants array
2. **Read**: Display variants in expandable UI sections
3. **Update**: Modify existing variant in variants array
4. **Delete**: Remove variant from variants array

### Data Validation
- Ensure variant names are unique within a codec
- Validate bitrate structure for different resolutions and frame rates
- Maintain referential integrity when modifying variants

## Error Handling

### UI Error States
- **Validation Errors**: Display inline validation messages for invalid variant data
- **Network Errors**: Show retry options for failed Firebase operations
- **Conflict Resolution**: Handle concurrent edits with user-friendly messages

### Service Layer Error Handling
- **Firebase Errors**: Wrap Firebase exceptions with user-friendly messages
- **Data Integrity**: Validate data structure before committing changes
- **Rollback Capability**: Implement transaction-based updates where possible

### Error Recovery
- **Auto-retry**: Implement automatic retry for transient network errors
- **Local Caching**: Maintain local state during network issues
- **User Feedback**: Provide clear status indicators for all operations

## Testing Strategy

### Unit Testing
- **Service Methods**: Test all new Firebase service methods for variant CRUD
- **Component Logic**: Test variant editing state management
- **Data Validation**: Test input validation and error handling

### Integration Testing
- **Firebase Integration**: Test end-to-end variant CRUD operations
- **UI Interactions**: Test variant editing workflows
- **Error Scenarios**: Test error handling and recovery

### User Acceptance Testing
- **Admin Workflow**: Verify complete variant management workflow
- **UI Usability**: Confirm calculate button removal doesn't impact user experience
- **Data Persistence**: Verify all changes are properly saved to Firestore

### Testing Scenarios

#### Calculate Button Removal
1. Verify calculations still work automatically on input changes
2. Confirm no broken UI elements or layout issues
3. Test URL-based calculation loading

#### Variant CRUD Operations
1. **Create**: Add new variants with various bitrate configurations
2. **Read**: Display variants in organized, readable format
3. **Update**: Edit existing variant names, descriptions, and bitrates
4. **Delete**: Remove variants with confirmation dialogs
5. **Validation**: Test invalid data handling and error messages
6. **Persistence**: Verify all changes are saved to and loaded from Firestore

#### Error Handling
1. Test network disconnection scenarios
2. Test invalid data submission
3. Test concurrent editing conflicts
4. Test Firebase permission errors

## Implementation Considerations

### Performance
- **Lazy Loading**: Load variant details only when expanded
- **Debounced Updates**: Prevent excessive Firebase writes during editing
- **Optimistic Updates**: Update UI immediately with rollback on errors

### Security
- **Admin Authentication**: Maintain existing admin authentication requirements
- **Data Validation**: Server-side validation for all variant operations
- **Permission Checks**: Verify admin permissions for all write operations

### Backward Compatibility
- **Data Migration**: Ensure existing codec data remains compatible
- **API Consistency**: Maintain existing service method signatures where possible
- **Fallback Handling**: Graceful degradation if Firebase is unavailable