import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FlowBuilderPage } from './components/FlowBuilderPage';
import { withBuilder } from '@builder6/react';

const queryClient = new QueryClient();

const FlowBuilder = (props) => (
  <Suspense fallback={<div>Loading...</div>}>
    <QueryClientProvider client={queryClient}>
      <FlowBuilderPage {...props}/>
    </QueryClientProvider>
  </Suspense>
)

withBuilder(FlowBuilder, {
  name: 'AP:FlowBuilder',
  inputs: [
    {
      name: 'flowId',
      type: 'string',
      required: true,
    },
  ],
});

export {
  FlowBuilder,
}