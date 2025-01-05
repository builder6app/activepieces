import {
    DefaultErrorFunction,
    SetErrorFunction,
  } from '@sinclair/typebox/errors';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  
  import { Toaster } from '@/components/ui/toaster';
  import { TooltipProvider } from '@/components/ui/tooltip';
  
  import { ApRouter } from './router';
  
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
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <ApRouter />
            <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  
  export default App;
  