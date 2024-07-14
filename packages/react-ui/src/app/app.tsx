

import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip';
import { router } from './router';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { DefaultErrorFunction, SetErrorFunction } from "@sinclair/typebox/errors";
import { NotificationProvider } from '@/contexts/notifications';

const queryClient = new QueryClient();
let typesFormatsAdded = false;

if (!typesFormatsAdded) {
  SetErrorFunction((error) => {
    return error?.schema?.errorMessage ?? DefaultErrorFunction(error);
   });
   typesFormatsAdded = true;
}

export function App() {
  return (
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </NotificationProvider>
  );
}

export default App;
