# Better Coaching - Codebase Knowledge

This file contains patterns, conventions, and learnings for anyone (human or AI) working on this codebase.

## Project Structure

```
bettercoaching/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── middleware/
│   └── prisma/        # Database schema
│
├── mobile/            # React Native + Expo app (MAIN UI WORK HERE)
│   ├── app/           # Expo Router screens
│   │   ├── (tabs)/    # Tab-based navigation
│   │   ├── coach/     # Coach detail [id].tsx
│   │   ├── chat/      # Chat screen [agentId].tsx
│   │   └── creator/   # Creator studio
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API, Auth services
│   │   ├── stores/      # Zustand state management
│   │   └── types/       # TypeScript types
│   ├── tailwind.config.js  # NativeWind/Tailwind theme
│   └── app.json         # Expo config
│
└── scripts/ralph/     # Ralph automation
```

## Tech Stack Patterns

### NativeWind (Tailwind for React Native)

- Use `className` prop for styling (NOT style objects)
- Import from `react-native` for components, styling via className
- Example:
  ```tsx
  <View className="flex-1 bg-white p-4">
    <Text className="text-lg font-semibold text-gray-900">Hello</Text>
  </View>
  ```

### Zustand State Management

- Stores are in `/mobile/src/stores/`
- Pattern: `useStore((state) => state.property)`
- Actions are part of the store, not separate
- Example:
  ```tsx
  const { user, signIn } = useAuthStore();
  ```

### Expo Router

- File-based routing in `/mobile/app/`
- Dynamic routes use `[param].tsx` naming
- Tab navigation in `(tabs)/` folder with `_layout.tsx`
- Use `router.push()` or `<Link>` for navigation

### TypeScript

- All files should be `.tsx` or `.ts`
- Types are in `/mobile/src/types/`
- Prefer explicit typing over `any`

## Component Conventions

### File Naming
- Components: PascalCase (`CoachCard.tsx`)
- Screens: lowercase with brackets for params (`[id].tsx`)
- Stores: camelCase (`authStore.ts`)

### Component Structure
```tsx
import { View, Text, Pressable } from 'react-native';
// ... other imports

interface Props {
  // typed props
}

export function ComponentName({ prop1, prop2 }: Props) {
  // hooks first
  // then handlers
  // then render
  return (
    <View className="...">
      {/* content */}
    </View>
  );
}
```

### Pressable for Touchables
- Use `Pressable` from react-native for touch interactions
- Add press feedback with opacity or scale
- Example:
  ```tsx
  <Pressable
    className="active:opacity-70"
    onPress={handlePress}
  >
    {/* content */}
  </Pressable>
  ```

## Existing Components to Know

- `CoachCard` - Coach preview card (redesigning in US-006)
- `CategoryCard` / `CategoryChip` - Category selection
- `MessageBubble` - Chat messages (in chat screen)

## Gotchas

### NativeWind
- Not all Tailwind utilities work in React Native
- No hover states (mobile), use `active:` for press states
- Flexbox is default (no need for `flex` class usually)
- `gap-*` works for spacing in flex containers

### Safe Areas
- Always use `SafeAreaView` or safe area padding for screens
- Bottom tab bar and iOS notch need consideration

### Keyboard
- Use `KeyboardAvoidingView` for screens with inputs
- `behavior="padding"` on iOS, `behavior="height"` on Android

### Images/Icons
- Using emoji for coach avatars currently
- For icons, can use Expo vector icons or Lucide

## Color Palette (Current → New)

Current primary: Indigo (#4F46E5)
New primary: Blue (#2563EB) - more trust-building

See `tailwind.config.js` for full color definitions.

## Running Quality Checks

From `/mobile` directory:
```bash
npm run typecheck   # TypeScript compilation check
npm run lint        # ESLint
npm start           # Start Expo dev server
```

## Database Notes

- PostgreSQL via Prisma
- Schema at `/backend/prisma/schema.prisma`
- Key tables: users, agents, conversations, messages

## API Integration

- Base URL configured via `EXPO_PUBLIC_API_URL`
- Auth tokens stored in Expo SecureStore
- API service handles token refresh automatically

---

## Learnings (Updated by Ralph)

*This section will be populated as Ralph discovers patterns during the UI revamp.*
