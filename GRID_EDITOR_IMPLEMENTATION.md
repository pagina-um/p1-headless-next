# Grid Editor Implementation Guide

## Overview

This document outlines the implementation plan for integrating the drag-and-drop grid layout editor into Payload CMS. The goal is to allow editors to create custom grid-based page layouts directly within Payload's admin interface.

## ✅ What's Already Done

### 1. Database Schema Updates

**Pages Collection** (`collections/Pages.ts`)
- ✅ Added `pageType` field with options: "article" or "grid-layout"
- ✅ Conditional `content` field (rich text) - shows only for article pages
- ✅ Conditional `gridLayout` field (relationship) - shows only for grid-layout pages
- ✅ Admin-only access control

**GridLayouts Collection** (`collections/GridLayouts.ts`)
- ✅ Stores grid state as JSON
- ✅ Tracks creator via `createdBy` relationship
- ✅ Tracks usage via `usedBy` relationship (auto-populated)
- ✅ Admin-only access, hidden from main navigation
- ✅ `gridState` marked as read-only (edited via UI, not directly)

### 2. API Infrastructure

**Endpoint:** `/api/grid-layouts/route.ts`
- ✅ `GET` - Fetch all layouts or active layout (`?active=true`)
- ✅ `POST` - Create or update grid layout
- ✅ Auto-deduplication (updates existing if found)
- ✅ Returns default empty grid state if none exists

## 🔨 What Needs to Be Built

### Phase 1: Grid Editor UI (HIGH PRIORITY)

#### 1.1 Create Grid Editor Page

**Location:** `/src/app/(payload)/admin/grid-editor/[[...params]]/page.tsx`

**Purpose:** Full-page grid editor accessible via:
- `/admin/grid-editor/new` - Create new layout
- `/admin/grid-editor/[layoutId]` - Edit existing layout
- Link button from Pages > Grid Layout field

**Requirements:**
```typescript
// Grid Editor Page Structure
"use client"

import { GridProvider } from "@/components/ui/GridContext"
import { EditableGrid } from "@/components/grid/EditableGrid"
import { GridEditorToolbar } from "./components/GridEditorToolbar"
import { ContentPicker } from "./components/ContentPicker"

export default function GridEditorPage({ params }) {
  const layoutId = params?.params?.[0] // 'new' or layoutId

  return (
    <GridProvider>
      <div className="grid-editor-container">
        <GridEditorToolbar layoutId={layoutId} />
        <div className="grid-editor-layout">
          <ContentPicker />
          <EditableGrid columns={6} />
        </div>
      </div>
    </GridProvider>
  )
}
```

#### 1.2 Create Grid Editor Components

**A. GridEditorToolbar** (`/admin/grid-editor/components/GridEditorToolbar.tsx`)

Features:
- Save button → POST to `/api/grid-layouts`
- Clear button → Remove all blocks
- Reset button → Restore to last saved state
- Name input → Set layout name
- Back button → Return to Pages collection

```typescript
interface GridEditorToolbarProps {
  layoutId: string | 'new'
}

export function GridEditorToolbar({ layoutId }: GridEditorToolbarProps) {
  const { gridState, handleSave, handleClearLayout } = useGrid()

  async function saveLayout() {
    await fetch('/api/grid-layouts', {
      method: 'POST',
      body: JSON.stringify({
        gridState,
        name: layoutName,
        // If editing existing, include ID for update
        ...(layoutId !== 'new' && { id: layoutId })
      })
    })
  }

  return (
    <div className="toolbar">
      <input type="text" placeholder="Layout Name" />
      <button onClick={saveLayout}>Save Layout</button>
      <button onClick={handleClearLayout}>Clear</button>
      <Link href="/admin/collections/pages">Back to Pages</Link>
    </div>
  )
}
```

**B. ContentPicker** (`/admin/grid-editor/components/ContentPicker.tsx`)

Tabbed interface for adding content blocks:

```typescript
export function ContentPicker() {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'static'>('posts')

  return (
    <div className="content-picker">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Individual Posts</TabsTrigger>
          <TabsTrigger value="categories">Category Blocks</TabsTrigger>
          <TabsTrigger value="static">Static Blocks</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <PostsList />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesList />
        </TabsContent>

        <TabsContent value="static">
          <StaticBlocksList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Phase 2: Data Source Components

These components were deleted in the cleanup and need to be recreated with Payload API:

#### 2.1 PostsList Component

**Location:** `/src/app/(payload)/admin/grid-editor/components/PostsList.tsx`

```typescript
"use client"

export function PostsList() {
  const [posts, setPosts] = useState([])
  const { handleCreateStoryBlock } = useGrid()

  useEffect(() => {
    // Fetch from Payload API
    fetch('/api/posts?limit=50&sort=-publishedAt')
      .then(res => res.json())
      .then(data => setPosts(data.docs))
  }, [])

  return (
    <div className="posts-list">
      {posts.map(post => (
        <button
          key={post.id}
          onClick={() => handleCreateStoryBlock(post.wpDatabaseId, post.id)}
        >
          <img src={post.featuredImage?.url} />
          <h3>{post.title}</h3>
          <span>{formatDate(post.publishedAt)}</span>
        </button>
      ))}
    </div>
  )
}
```

**Required API Endpoint:** `/src/app/api/posts/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')

  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'posts',
    limit,
    sort: '-publishedAt',
    where: {
      status: { equals: 'publish' }
    }
  })

  return NextResponse.json(result)
}
```

#### 2.2 CategoriesList Component

**Location:** `/src/app/(payload)/admin/grid-editor/components/CategoriesList.tsx`

```typescript
"use client"

export function CategoriesList() {
  const [categories, setCategories] = useState([])
  const { handleCreateCategoryBlock } = useGrid()

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.docs))
  }, [])

  return (
    <div className="categories-list">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => handleCreateCategoryBlock(category.wpDatabaseId, category.name)}
        >
          <span>{category.name}</span>
          <span className="count">{category.postCount || 0} posts</span>
        </button>
      ))}
    </div>
  )
}
```

**Required API Endpoint:** `/src/app/api/categories/route.ts`

```typescript
export async function GET() {
  const payload = await getPayloadInstance()

  // Fetch categories with post counts
  const result = await payload.find({
    collection: 'categories',
    sort: 'name',
  })

  // TODO: Add post count calculation
  // For each category, count posts that have this category

  return NextResponse.json(result)
}
```

#### 2.3 StaticBlocksList Component

**Location:** `/src/app/(payload)/admin/grid-editor/components/StaticBlocksList.tsx`

```typescript
import { STATIC_BLOCK_TYPES } from "@/types"

export function StaticBlocksList() {
  const { handleCreateStaticBlock } = useGrid()

  const staticBlockOptions = [
    { type: 'newsletter', label: 'Newsletter Signup', icon: '📧' },
    { type: 'podcast', label: 'Podcast Player', icon: '🎙️' },
    { type: 'donation', label: 'Donation Box', icon: '💝' },
    { type: 'divider', label: 'Visual Divider', icon: '〰️' },
    { type: 'accountsCounter', label: 'Accounts Counter', icon: '📊' },
    { type: 'bookPresale', label: 'Book Presale', icon: '📚' },
  ]

  return (
    <div className="static-blocks-list">
      {staticBlockOptions.map(block => (
        <button
          key={block.type}
          onClick={() => handleCreateStaticBlock(block.type as any)}
        >
          <span className="icon">{block.icon}</span>
          <span>{block.label}</span>
        </button>
      ))}
    </div>
  )
}
```

### Phase 3: Update GridContext

**File:** `/src/components/ui/GridContext.tsx`

**Changes needed:**

1. Update load endpoint:
```typescript
// OLD
const response = await fetch("/api/grid")

// NEW
const response = await fetch("/api/grid-layouts?active=true")
const layout = await response.json()
const gridState = layout?.gridState || initialGridState
```

2. Update save endpoint:
```typescript
// OLD
await fetch("/api/grid", { method: "POST", body: JSON.stringify(gridState) })

// NEW
await fetch("/api/grid-layouts", {
  method: "POST",
  body: JSON.stringify({
    gridState,
    name: "Homepage Grid" // Or get from context
  })
})
```

3. Add layout ID tracking:
```typescript
const [layoutId, setLayoutId] = useState<string | null>(null)

// After loading:
setLayoutId(layout.id)

// When saving, include ID if updating
```

### Phase 4: Integrate with Pages Collection

#### 4.1 Add "Edit Layout" Button to Pages

**Goal:** When editing a page with `pageType: "grid-layout"`, show a button to open the grid editor.

**Option A:** Custom field component (recommended)

Create `/src/collections/Pages.ts` with custom field UI:

```typescript
{
  name: 'gridLayout',
  type: 'relationship',
  relationTo: 'grid-layouts',
  admin: {
    condition: (data) => data.pageType === 'grid-layout',
    components: {
      Field: CustomGridLayoutField, // Custom component
    },
  },
}
```

**CustomGridLayoutField component:**

```typescript
export function CustomGridLayoutField({ value, onChange }) {
  const layoutId = typeof value === 'object' ? value.id : value

  return (
    <div>
      <label>Grid Layout</label>

      {layoutId ? (
        <div>
          <p>Current layout: {layoutId}</p>
          <Link href={`/admin/grid-editor/${layoutId}`} target="_blank">
            <button type="button">Edit Grid Layout →</button>
          </Link>
        </div>
      ) : (
        <Link href="/admin/grid-editor/new" target="_blank">
          <button type="button">Create New Grid Layout →</button>
        </Link>
      )}

      {/* Standard relationship selector below */}
      <select value={layoutId} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select existing layout...</option>
        {/* Fetch and map grid-layouts options */}
      </select>
    </div>
  )
}
```

**Option B:** Description with link (simpler)

```typescript
{
  name: 'gridLayout',
  type: 'relationship',
  relationTo: 'grid-layouts',
  admin: {
    condition: (data) => data.pageType === 'grid-layout',
    description: 'Select a grid layout or <a href="/admin/grid-editor/new" target="_blank">create a new one</a>',
  },
}
```

### Phase 5: Update Homepage

**File:** `/src/app/(frontend)/page.tsx`

**Replace current implementation:**

```typescript
// OLD: Load from Redis/local
async function getInitialState(): Promise<GridState | null> {
  if (isDevelopment) {
    return await loadGridStateLocal()
  } else {
    return await loadGridStateRedis()
  }
}

const initialState = await getInitialState()
```

**NEW: Load from Pages collection**

```typescript
import { getPayloadInstance } from "@/services/payload-api"

async function getHomepageGridState(): Promise<GridState | null> {
  try {
    const payload = await getPayloadInstance()

    // Find homepage by slug
    const result = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: 'homepage' }
      },
      depth: 2, // Include gridLayout relationship
      limit: 1
    })

    const homepage = result.docs[0]

    // Check if it's a grid layout page
    if (homepage?.pageType === 'grid-layout' && homepage.gridLayout) {
      return homepage.gridLayout.gridState
    }

    // Fallback: empty grid
    return { blocks: [], createdAt: new Date().toISOString() }
  } catch (error) {
    console.error('Failed to load homepage grid:', error)
    return null
  }
}

export default async function HomePage() {
  const gridState = await getHomepageGridState()

  if (!gridState) {
    return <div>Failed to load content</div>
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto pb-8">
        <NewsGrid blocks={gridState.blocks} />
      </main>
      <PostFooter />
    </>
  )
}
```

### Phase 6: Cleanup Old Storage

Once everything works with Payload:

1. **Delete legacy storage files:**
   - `/src/services/redis.ts`
   - `/src/services/local-storage.ts`
   - `/src/services/jsonbin.ts`

2. **Update or remove:**
   - `/src/app/api/grid/route.ts` (old endpoint)

3. **Remove environment variables:**
   - `REDIS_URL` (if not used elsewhere)
   - `JSONBIN_API_KEY`

## Testing Checklist

- [ ] Create a new page with `pageType: "grid-layout"`
- [ ] Click "Create New Grid Layout" button
- [ ] Add posts to grid via drag-and-drop
- [ ] Add category blocks to grid
- [ ] Add static blocks to grid
- [ ] Save the layout
- [ ] Assign layout to page
- [ ] View page on frontend - grid renders correctly
- [ ] Edit existing layout - changes persist
- [ ] Create second page with different layout
- [ ] Both pages render their respective layouts

## UI/UX Considerations

### Grid Editor Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Layout Name Input]  [Save] [Clear] [Reset] [Back to Pages] │
├─────────────────┬───────────────────────────────────────────┤
│  Content Picker │         Drag-and-Drop Grid Canvas         │
│                 │                                            │
│ [Posts]         │  ┌────┬────┬────┬────┬────┬────┐          │
│ - Post 1        │  │    │    │    │    │    │    │          │
│ - Post 2        │  ├────┼────┼────┼────┼────┼────┤          │
│ - Post 3        │  │    │    │    │    │    │    │          │
│                 │  └────┴────┴────┴────┴────┴────┘          │
│ [Categories]    │                                            │
│ - Politics      │  Drag items from left to place in grid    │
│ - Sports        │                                            │
│                 │                                            │
│ [Static]        │                                            │
│ - Newsletter    │                                            │
│ - Podcast       │                                            │
└─────────────────┴───────────────────────────────────────────┘
```

### Styling Notes

- Use Payload's design system for consistency
- Full-screen layout (remove sidebars)
- Mobile-responsive (though primarily desktop tool)
- Loading states during save/fetch
- Success/error toasts for user feedback

## Architecture Diagram

```
┌──────────────┐
│   Pages      │
│  Collection  │
└──────┬───────┘
       │ pageType: "grid-layout"
       │ gridLayout: [relationship]
       ↓
┌──────────────┐
│ GridLayouts  │
│  Collection  │
└──────┬───────┘
       │ gridState: JSON
       │ usedBy: [pages]
       ↓
┌──────────────────┐
│  Grid Editor UI  │
│  /admin/grid-    │
│  editor/[id]     │
└──────┬───────────┘
       │
       ├─→ Fetch posts from Payload
       ├─→ Fetch categories from Payload
       ├─→ Drag & drop interface
       └─→ Save to GridLayouts collection
```

## Implementation Timeline Estimate

**Phase 1:** Grid Editor UI (4-6 hours)
- Page structure
- Toolbar component
- Content picker tabs

**Phase 2:** Data Components (3-4 hours)
- PostsList with API
- CategoriesList with API
- StaticBlocksList
- API endpoints

**Phase 3:** GridContext Updates (2-3 hours)
- Update endpoints
- Test save/load
- Error handling

**Phase 4:** Pages Integration (2-3 hours)
- Custom field component
- Edit button
- Testing workflow

**Phase 5:** Homepage Update (1-2 hours)
- Load from Pages
- Remove old storage
- Test rendering

**Phase 6:** Cleanup & Polish (2-3 hours)
- Delete legacy files
- Documentation
- Final testing

**Total: 14-21 hours**

## Open Questions

1. **Caching Strategy:**
   - Should homepage grid be cached? (ISR, React cache)
   - Invalidation strategy when layout updates?

2. **Preview Mode:**
   - Should there be a preview before saving?
   - Live preview while editing?

3. **Version History:**
   - Should we track layout versions?
   - Ability to restore previous versions?

4. **Permissions:**
   - Can editors create layouts, or only admins?
   - Can layouts be shared across users?

5. **Validation:**
   - Min/max blocks per grid?
   - Required blocks (e.g., must have at least one post)?

## Resources

- Payload Custom Field Components: https://payloadcms.com/docs/fields/overview#custom-components
- React Grid Layout: https://github.com/react-grid-layout/react-grid-layout
- Existing types: `/src/types/index.ts`
- Existing grid rendering: `/src/components/grid/NewsGrid.tsx`

## Support

If you encounter issues or have questions:
1. Check this guide first
2. Review existing components in `/src/components/grid/`
3. Test API endpoints directly with curl/Postman
4. Check Payload admin console for errors

---

**Last Updated:** 2025-11-21
**Status:** Foundation Complete, UI Implementation Pending
