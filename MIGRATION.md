### Auth Context tsx migration

- Added type ReactNode and all shared domain types from the new types/index.ts.
```tsx
- import React, { createContext, useState, useContext, useEffect } from "react";
+ import React, { createContext, useState, useContext, useEffect, type ReactNode } from "react";
+ import type { User, AuthResult, AuthContextValue } from "../types/index";
```

- Context Creation: Original had no argument at all — now fully typed with a generic and an explicit null default
```tsx
- const AuthContext = createContext();
+ const AuthContext = createContext<AuthContextValue | null>(null);
```

-  useAuth — return type added
```tsx
- export const useAuth = () => {
+ export const useAuth = (): AuthContextValue => {}
```

- AuthProvider - children typed
```tsx
- export const useAuth = () => {
+ export const useAuth = (): AuthContextValue => {}
```

- useState - typed generics
```tsx
- const [user, setUser] = useState(null);
- const [token, setToken] = useState(null);
+ const [user, setUser] = useState<User | null>(null);
+ const [token, setToken] = useState<string | null>(null);
```

- Async Functions - explicit return types

register
before: implicit Promise<any>	after: Promise<AuthResult>

login
before: implicit Promise<any>	after: Promise<AuthResult>

logout
before: implicit void	after: explicit ():void

fetchProfile
before: implicit Promise<any>	after: Promise<User | null>

updateProfile
before: implicit Promise<any>	after: Promise<AuthResult & { user?: User }>


- Error handling — typed + ?? instead of ||
```tsx
- } catch (error) {
-   const message = error.response?.data?.message || "...";
+ } catch (error: unknown) {
+   const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "...";
```

- value object — explicitly typed
```tsx
- const value = { user, token, loading, ... };
+ const value: AuthContextValue = { user, token, loading, ... };
```